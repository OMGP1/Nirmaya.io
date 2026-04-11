import os
from twilio.rest import Client

# 1. Your Twilio Credentials
account_sid = os.environ.get('TWILIO_ACCOUNT_SID', 'YOUR_ACCOUNT_SID')
auth_token = os.environ.get('TWILIO_AUTH_TOKEN', 'YOUR_AUTH_TOKEN_HERE')
twilio_number = '+16416818950'

# 2. Your Emergency Contacts (Must be verified in Twilio Console!)
sos_contacts = [
    '+919930607460', 
    '+919930607460'
]

# 3. The SOS Message & Location
lat = 19.0760
lng = 72.8777
maps_link = f"https://maps.google.com/?q={lat},{lng}"

emergency_message = f"""🚨 SOS ALERT: This is an emergency message from Om. I need immediate assistance. Please contact me immediately.

📍 My current location:
{maps_link}
"""

def trigger_sos():
    print("Initiating SOS Broadcast...")
    client = Client(account_sid, auth_token)

    for contact in set(sos_contacts):  # use set to remove duplicates
        try:
            message = client.messages.create(
                body=emergency_message,
                from_=twilio_number,
                to=contact
            )
            print(f"✅ SOS sent to {contact}. SID: {message.sid}")
        except Exception as e:
            print(f"❌ Failed to send to {contact}. Error: {e}")

if __name__ == "__main__":
    trigger_sos()
