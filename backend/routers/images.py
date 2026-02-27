from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from database import get_db, UPLOADS_DIR
import aiosqlite
import os
import uuid

router = APIRouter(prefix="/api/products", tags=["Images"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

# Valid method keys → DB column names
METHOD_IMAGE_COLS = {
    "screen_printing": "screen_printing_image",
    "uv_printing": "uv_printing_image",
    "offset_printing": "offset_printing_image",
    "digital_printing": "digital_printing_image",
    "laser_engraving": "laser_engraving_image",
    "dtg_dtf": "dtg_dtf_image",
    "embroidery": "embroidery_image",
    "sublimation": "sublimation_image",
    "product": "image",  # main product image key
}


async def _save_upload(file: UploadFile, prefix: str):
    """Validate and save upload; return filename."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WEBP or GIF allowed")
    contents = await file.read()
    if len(contents) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Image must be under 5 MB")
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"{prefix}_{uuid.uuid4().hex[:8]}{ext}"
    with open(os.path.join(UPLOADS_DIR, filename), "wb") as f:
        f.write(contents)
    return filename


def _delete_file(filename: str):
    if filename:
        path = os.path.join(UPLOADS_DIR, filename)
        if os.path.exists(path):
            try:
                os.remove(path)
            except Exception:
                pass


# ── Product main image ────────────────────────────────────────────────────────

@router.post("/{product_id}/upload-image")
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute("SELECT id, image FROM products WHERE id = ?", (product_id,))
    row = await cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")

    _delete_file(row[1])
    filename = await _save_upload(file, f"product_{product_id}")
    await db.execute("UPDATE products SET image = ? WHERE id = ?", (filename, product_id))
    await db.commit()
    return {"image": filename, "image_url": f"/uploads/{filename}"}


@router.delete("/{product_id}/image")
async def delete_product_image(product_id: int, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT image FROM products WHERE id = ?", (product_id,))
    row = await cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    _delete_file(row[0])
    await db.execute("UPDATE products SET image = NULL WHERE id = ?", (product_id,))
    await db.commit()
    return {"message": "Image removed"}


# ── Per-method images ─────────────────────────────────────────────────────────

@router.post("/{product_id}/method-image/{method_key}")
async def upload_method_image(
    product_id: int,
    method_key: str,
    file: UploadFile = File(...),
    db: aiosqlite.Connection = Depends(get_db)
):
    col = METHOD_IMAGE_COLS.get(method_key)
    if not col or method_key == "product":
        raise HTTPException(status_code=400, detail=f"Invalid method key: {method_key}")

    cursor = await db.execute(f"SELECT id, {col} FROM products WHERE id = ?", (product_id,))
    row = await cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")

    _delete_file(row[1])
    filename = await _save_upload(file, f"p{product_id}_{method_key}")
    await db.execute(f"UPDATE products SET {col} = ? WHERE id = ?", (filename, product_id))
    await db.commit()
    return {"image": filename, "image_url": f"/uploads/{filename}", "method": method_key}


@router.delete("/{product_id}/method-image/{method_key}")
async def delete_method_image(
    product_id: int,
    method_key: str,
    db: aiosqlite.Connection = Depends(get_db)
):
    col = METHOD_IMAGE_COLS.get(method_key)
    if not col or method_key == "product":
        raise HTTPException(status_code=400, detail=f"Invalid method key: {method_key}")

    cursor = await db.execute(f"SELECT {col} FROM products WHERE id = ?", (product_id,))
    row = await cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")

    _delete_file(row[0])
    await db.execute(f"UPDATE products SET {col} = NULL WHERE id = ?", (product_id,))
    await db.commit()
    return {"message": "Method image removed"}
