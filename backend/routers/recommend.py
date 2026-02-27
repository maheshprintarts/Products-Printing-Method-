from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from models import RecommendationOut, PrintingMethodDetail, ProductOut
import aiosqlite

router = APIRouter(prefix="/api/recommend", tags=["Recommend"])

METHOD_FIELDS = [
    ("Screen Printing", "screen_printing"),
    ("UV Printing", "uv_printing"),
    ("Offset Printing", "offset_printing"),
    ("Digital Printing", "digital_printing"),
    ("Laser Engraving", "laser_engraving"),
    ("DTG / DTF", "dtg_dtf"),
    ("Embroidery", "embroidery"),
    ("Sublimation", "sublimation"),
]


def parse_production_time(production_time_str: str, method_name: str):
    if not production_time_str:
        return None
    lines = production_time_str.split("\n")
    method_keywords = {
        "Screen Printing": ["Screen"],
        "UV Printing": ["UV"],
        "Offset Printing": ["Offset"],
        "Digital Printing": ["Digital"],
        "Laser Engraving": ["Engrave", "Engraving"],
        "DTG / DTF": ["DTG", "DTF"],
        "Embroidery": ["Emb", "Embroidery"],
        "Sublimation": ["Subilimation", "Sublimation"],
    }
    keywords = method_keywords.get(method_name, [])
    for line in lines:
        for kw in keywords:
            if kw.lower() in line.lower():
                return line.strip()
    return None


def row_to_dict(row):
    return dict(zip(row.keys(), row))


@router.get("/{product_id}", response_model=RecommendationOut)
async def recommend(product_id: int, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    row = await cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")

    product_dict = row_to_dict(row)
    methods = []

    for method_name, field in METHOD_FIELDS:
        value = product_dict.get(field)
        available = value is not None and value.strip().upper() != "NA" and value.strip() != ""

        color_limit = None
        notes = None
        if available:
            if value.strip().upper() == "MULTI":
                color_limit = "Multi-color"
            elif any(c.isdigit() for c in value):
                parts = value.split("(")
                color_limit = parts[0].strip() + " color(s)"
                if len(parts) > 1:
                    notes = "(" + parts[1]
            else:
                notes = value.strip()

        production_time = parse_production_time(product_dict.get("production_time"), method_name)

        # Per-method image filename
        method_image = product_dict.get(f"{field}_image")

        methods.append(PrintingMethodDetail(
            method=method_name,
            method_key=field,
            color_limit=color_limit if available else None,
            available=available,
            notes=notes if available else None,
            production_time=production_time if available else None,
            method_image=method_image if available else None,
        ))

    return RecommendationOut(
        product=ProductOut(**product_dict),
        methods=methods
    )
