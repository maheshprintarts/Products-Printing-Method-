from pydantic import BaseModel
from typing import Optional, List


class Token(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    username: str
    password: str


class PrintingMethodDetail(BaseModel):
    method: str
    method_key: str
    color_limit: Optional[str]
    available: bool
    notes: Optional[str]
    production_time: Optional[str]
    method_image: Optional[str] = None  # filename of per-method uploaded image


class ProductBase(BaseModel):
    name: str
    category: str
    material: Optional[str] = None


class ProductCreate(ProductBase):
    screen_printing: Optional[str] = None
    uv_printing: Optional[str] = None
    offset_printing: Optional[str] = None
    digital_printing: Optional[str] = None
    laser_engraving: Optional[str] = None
    dtg_dtf: Optional[str] = None
    embroidery: Optional[str] = None
    sublimation: Optional[str] = None
    production_time: Optional[str] = None
    image: Optional[str] = None
    # Per-method images
    screen_printing_image: Optional[str] = None
    uv_printing_image: Optional[str] = None
    offset_printing_image: Optional[str] = None
    digital_printing_image: Optional[str] = None
    laser_engraving_image: Optional[str] = None
    dtg_dtf_image: Optional[str] = None
    embroidery_image: Optional[str] = None
    sublimation_image: Optional[str] = None


class ProductUpdate(ProductCreate):
    pass


class ProductOut(ProductCreate):
    id: int

    class Config:
        from_attributes = True


class RecommendationOut(BaseModel):
    product: ProductOut
    methods: List[PrintingMethodDetail]
