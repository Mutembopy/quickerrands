from .. import db
from ..models.user import User, AgentProfile
from ..models.booking import Booking
from ..services.pricing import calculate_distance
import random

def assign_agent(booking_id):
    """
    Automatically assign the best available agent to a booking
    Returns the assigned agent or None if no agent available
    """
    booking = Booking.query.get(booking_id)
    if not booking:
        return None

    # Find available agents
    available_agents = AgentProfile.query.filter_by(is_available=True).all()

    if not available_agents:
        return None

    # Calculate distance from each agent to pickup location
    agent_distances = []
    for agent in available_agents:
        if agent.current_location_lat and agent.current_location_lng:
            distance = calculate_distance(
                agent.current_location_lat, agent.current_location_lng,
                booking.pickup_lat, booking.pickup_lng
            )
            agent_distances.append((agent, distance))
        else:
            # If no location data, assume maximum distance
            agent_distances.append((agent, 9999))

    # Sort by distance (closest first), then by rating
    agent_distances.sort(key=lambda x: (x[1], -x[0].rating_average))

    # Get the best agent (closest with highest rating)
    best_agent = agent_distances[0][0] if agent_distances else None

    if best_agent:
        # Mark agent as unavailable temporarily
        best_agent.is_available = False
        db.session.commit()

    return best_agent

def find_agents_nearby(lat, lng, radius_km=5):
    """
    Find agents within a certain radius of a location
    """
    agents = AgentProfile.query.filter_by(is_available=True).all()
    nearby_agents = []

    for agent in agents:
        if agent.current_location_lat and agent.current_location_lng:
            distance = calculate_distance(
                lat, lng,
                agent.current_location_lat, agent.current_location_lng
            )
            if distance <= radius_km:
                nearby_agents.append({
                    'agent': agent,
                    'distance': distance
                })

    # Sort by distance
    nearby_agents.sort(key=lambda x: x['distance'])

    return nearby_agents

def release_agent(agent_id):
    """
    Mark an agent as available again after completing a job
    """
    agent = AgentProfile.query.get(agent_id)
    if agent:
        agent.is_available = True
        db.session.commit()

def get_agent_workload(agent_id):
    """
    Get current workload for an agent
    """
    active_bookings = Booking.query.filter_by(
        agent_id=agent_id,
        status='in_progress'
    ).count()

    pending_bookings = Booking.query.filter_by(
        agent_id=agent_id,
        status='accepted'
    ).count()

    return {
        'active_jobs': active_bookings,
        'pending_jobs': pending_bookings,
        'total_workload': active_bookings + pending_bookings
    }

def can_assign_more_jobs(agent_id, max_concurrent_jobs=3):
    """
    Check if an agent can take more jobs
    """
    workload = get_agent_workload(agent_id)
    return workload['total_workload'] < max_concurrent_jobs