from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from models import ProductOut, ProductCreate, ProductUpdate
from typing import Optional, List
import aiosqlite

router = APIRouter(prefix="/api/products", tags=["Products"])


def row_to_dict(row):
    return dict(zip(row.keys(), row))


@router.get("", response_model=List[ProductOut])
async def list_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: aiosqlite.Connection = Depends(get_db)
):
    query = "SELECT * FROM products WHERE 1=1"
    params = []
    if search:
        query += " AND name LIKE ?"
        params.append(f"%{search}%")
    if category:
        query += " AND category = ?"
        params.append(category)
    query += " ORDER BY id"
    cursor = await db.execute(query, params)
    rows = await cursor.fetchall()
    return [row_to_dict(r) for r in rows]


@router.get("/categories", response_model=List[str])
async def get_categories(db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT DISTINCT category FROM products ORDER BY category")
    rows = await cursor.fetchall()
    return [r[0] for r in rows]


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: int, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    row = await cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    return row_to_dict(row)


@router.post("", response_model=ProductOut)
async def create_product(data: ProductCreate, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("""
        INSERT INTO products (name, category, material, screen_printing, uv_printing,
            offset_printing, digital_printing, laser_engraving, dtg_dtf,
            embroidery, sublimation, production_time)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    """, (
        data.name, data.category, data.material,
        data.screen_printing, data.uv_printing, data.offset_printing,
        data.digital_printing, data.laser_engraving, data.dtg_dtf,
        data.embroidery, data.sublimation, data.production_time
    ))
    await db.commit()
    new_id = cursor.lastrowid
    cursor = await db.execute("SELECT * FROM products WHERE id = ?", (new_id,))
    row = await cursor.fetchone()
    return row_to_dict(row)


@router.put("/{product_id}", response_model=ProductOut)
async def update_product(product_id: int, data: ProductUpdate, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT id FROM products WHERE id = ?", (product_id,))
    if not await cursor.fetchone():
        raise HTTPException(status_code=404, detail="Product not found")
    await db.execute("""
        UPDATE products SET name=?, category=?, material=?, screen_printing=?, uv_printing=?,
            offset_printing=?, digital_printing=?, laser_engraving=?, dtg_dtf=?,
            embroidery=?, sublimation=?, production_time=? WHERE id=?
    """, (
        data.name, data.category, data.material,
        data.screen_printing, data.uv_printing, data.offset_printing,
        data.digital_printing, data.laser_engraving, data.dtg_dtf,
        data.embroidery, data.sublimation, data.production_time, product_id
    ))
    await db.commit()
    cursor = await db.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    row = await cursor.fetchone()
    return row_to_dict(row)


@router.delete("/{product_id}")
async def delete_product(product_id: int, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT id FROM products WHERE id = ?", (product_id,))
    if not await cursor.fetchone():
        raise HTTPException(status_code=404, detail="Product not found")
    await db.execute("DELETE FROM products WHERE id = ?", (product_id,))
    await db.commit()
    return {"message": "Product deleted successfully"}
