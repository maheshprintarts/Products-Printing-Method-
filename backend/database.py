import aiosqlite
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "printing_system.db")
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

# All 19 products from the Excel spec
# Fields: name, category, material, screen_printing, uv_printing, offset_printing,
#         digital_printing, laser_engraving, dtg_dtf, embroidery, sublimation, production_time
SEED_PRODUCTS = [
    (
        "Pen (Metal type)", "Writing", "Metal",
        "1", "2", "NA", "NA", "Engraved finish", "NA", "NA", "NA",
        "Screen Printing (Qty 100–500) = 4 working days\nUV Printing (Qty 50) = 4 working days\nLaser Engraving (Qty 100) = 1 working day"
    ),
    (
        "Pen (Paper type)", "Writing", "Paper",
        "1", "NA", "NA", "NA", "NA", "NA", "NA", "NA",
        "Screen Printing (Qty 100–500) = 4 working days"
    ),
    (
        "Pen (Plastic type)", "Writing", "Plastic",
        "1", "1", "NA", "NA", "NA", "NA", "NA", "NA",
        "Screen Printing (Qty 100–500) = 4 working days\nUV Printing (Qty 100) = 4 working days"
    ),
    (
        "Tote Bag (Cloth)", "Bags", "Cloth",
        "2", "NA", "NA", "NA", "NA", "Multi", "Multi", "NA",
        "Screen Printing (Qty 100–500) = 4 working days\nDTG/DTF (Qty 100) = 2 working days"
    ),
    (
        "Tote Bag (Paper)", "Bags", "Paper",
        "4", "NA", "NA", "NA", "NA", "NA", "NA", "NA",
        "Screen Printing (Qty 100) = 4 working days"
    ),
    (
        "Bottle (Plastic)", "Drinkware", "Plastic",
        "1", "2", "NA", "NA", "NA", "NA", "NA", "NA",
        "Screen Printing (Qty 100) = 5 working days\nUV Printing (Qty 100) = 4 working days"
    ),
    (
        "Mug (Plastic)", "Drinkware", "Plastic",
        "1", "2", "NA", "NA", "NA", "NA", "NA", "NA",
        "Screen Printing (Qty 100) = 5 working days\nUV Printing (Qty 100) = 4 working days"
    ),
    (
        "Mug (Ceramic)", "Drinkware", "Ceramic",
        "1", "2", "NA", "NA", "NA", "NA", "NA", "Multi",
        "Screen Printing (Qty 100) = 5 working days\nUV Printing (Qty 100) = 4 working days\nSublimation (Qty 100) = 3 working days"
    ),
    (
        "Mug (Steel)", "Drinkware", "Steel",
        "1", "2", "NA", "NA", "Engraved finish", "NA", "NA", "NA",
        "Screen Printing (Qty 100) = 5 working days\nUV Printing (Qty 100) = 4 working days\nLaser Engraving (Qty 50) = 1 working day"
    ),
    (
        "Keychain", "Accessories", "Varies by material",
        "1", "NA", "NA", "NA", "Engraved finish", "NA", "NA", "Multi",
        "Screen Printing (Qty 100) = 4 working days\nLaser Engraving (Qty 100) = 1 working day\nSublimation (Qty 100) = 3 working days"
    ),
    (
        "Diary / Planner (Paper)", "Stationery", "Paper",
        "4 (Prices may vary)", "3", "NA", "NA", "Engraved finish", "NA", "NA", "NA",
        "Screen Printing (Qty 100) = 3 working days\nUV Printing (Qty 100) = 4 working days\nLaser Engraving (Qty 100) = 1 working day"
    ),
    (
        "Diary / Planner (Leather)", "Stationery", "Leather",
        "3 (Prices may vary)", "2", "NA", "NA", "Engraved finish", "NA", "NA", "NA",
        "Screen Printing (Qty 100) = 5 working days\nUV Printing (Qty 100) = 4 working days\nLaser Engraving (Qty 100) = 1 working day"
    ),
    (
        "Mobile Stand (Metal)", "Tech Accessories", "Metal",
        "2 (Prices may vary)", "2", "NA", "NA", "Engraved finish", "NA", "NA", "NA",
        "Screen Printing (Qty 100) = 5 working days\nUV Printing (Qty 100) = 4 working days\nLaser Engraving (Qty 100) = 1 working day"
    ),
    (
        "Mobile Stand (Plastic)", "Tech Accessories", "Plastic",
        "2 (Prices may vary)", "2", "NA", "NA", "NA", "NA", "NA", "NA",
        "Screen Printing (Qty 100) = 5 working days\nUV Printing (Qty 100) = 4 working days"
    ),
    (
        "Table Calendar (Paper)", "Stationery", "Paper",
        "4 (Prices may vary)", "2", "NA", "NA", "NA", "NA", "NA", "NA",
        "Screen Printing (Qty 100) = 5 working days\nUV Printing (Qty 100) = 4 working days"
    ),
    (
        "Card Holder", "Accessories", "Varies by material",
        "2 (Prices may vary)", "2", "NA", "NA", "Engraved finish", "NA", "NA", "NA",
        "Screen Printing (Qty 100) = 5 working days\nUV Printing (Qty 100) = 4 working days\nLaser Engraving (Qty 100) = 1 working day"
    ),
    (
        "T-Shirt (Apparel)", "Apparel", "Cotton/Fabric",
        "4", "NA", "NA", "NA", "NA", "Multi", "Multi", "Multi",
        "DTG/DTF, Embroidery, or Sublimation (Qty 5+) = 2 working days\nScreen Printing (Qty 100+) = 4 working days"
    ),
    (
        "Stress Ball", "Novelty", "Rubber/PU",
        "1", "NA", "NA", "NA", "NA", "NA", "NA", "NA",
        "Screen Printing (Qty 1–100) = 5 working days"
    ),
    (
        "Bag", "Bags", "Varies",
        "1", "NA", "NA", "NA", "NA", "NA", "Multi", "NA",
        "Screen Printing (Qty 1–100) = 5 working days\nEmbroidery (Qty 10+) = 2 working days"
    ),
]


async def get_db():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                material TEXT,
                screen_printing TEXT,
                uv_printing TEXT,
                offset_printing TEXT,
                digital_printing TEXT,
                laser_engraving TEXT,
                dtg_dtf TEXT,
                embroidery TEXT,
                sublimation TEXT,
                production_time TEXT,
                image TEXT
            )
        """)
        # Migration: add image column if it doesn't exist yet
        try:
            await db.execute("ALTER TABLE products ADD COLUMN image TEXT")
            await db.commit()
        except Exception:
            pass  # Column already exists

        # Migration: add per-method image columns
        METHOD_IMG_COLS = [
            "screen_printing_image", "uv_printing_image", "offset_printing_image",
            "digital_printing_image", "laser_engraving_image", "dtg_dtf_image",
            "embroidery_image", "sublimation_image",
        ]
        for col in METHOD_IMG_COLS:
            try:
                await db.execute(f"ALTER TABLE products ADD COLUMN {col} TEXT")
                await db.commit()
            except Exception:
                pass  # Column already exists
        await db.commit()


        # Seed only if empty
        cursor = await db.execute("SELECT COUNT(*) FROM products")
        count = (await cursor.fetchone())[0]
        if count == 0:
            await db.executemany("""
                INSERT INTO products (
                    name, category, material,
                    screen_printing, uv_printing, offset_printing, digital_printing,
                    laser_engraving, dtg_dtf, embroidery, sublimation, production_time
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
            """, SEED_PRODUCTS)
            await db.commit()
