import math

def calculate_distance(lat1, lng1, lat2, lng2):
    """
    Calculate distance between two points using Haversine formula
    Returns distance in kilometers
    """
    # Convert to radians
    lat1_rad = math.radians(lat1)
    lng1_rad = math.radians(lng1)
    lat2_rad = math.radians(lat2)
    lng2_rad = math.radians(lng2)

    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlng = lng2_rad - lng1_rad

    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

    # Earth's radius in kilometers
    R = 6371.0

    return R * c

def calculate_price(pickup_lat, pickup_lng, delivery_lat, delivery_lng, base_rate=2.5):
    """
    Calculate price based on distance
    Base rate is ZMW 2.50 per kilometer
    """
    distance = calculate_distance(pickup_lat, pickup_lng, delivery_lat, delivery_lng)

    # Minimum charge for short distances
    if distance < 1:
        return 2.5

    # Calculate price with base rate
    price = distance * base_rate

    # Round to nearest 0.50
    return round(price * 2) / 2

def get_price_estimate(pickup_lat, pickup_lng, delivery_lat, delivery_lng):
    """
    Get detailed price estimate with breakdown
    """
    distance = calculate_distance(pickup_lat, pickup_lng, delivery_lat, delivery_lng)
    base_price = calculate_price(pickup_lat, pickup_lng, delivery_lat, delivery_lng)

    # Add service fee (10%)
    service_fee = base_price * 0.1

    # Add tax (16% VAT in Zambia)
    subtotal = base_price + service_fee
    tax = subtotal * 0.16

    total = subtotal + tax

    return {
        'distance_km': round(distance, 2),
        'base_price': round(base_price, 2),
        'service_fee': round(service_fee, 2),
        'tax': round(tax, 2),
        'total': round(total, 2),
        'currency': 'ZMW'
    }