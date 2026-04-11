import os
from twilio.rest import Client

# 1. Your Twilio Credentials
account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
twilio_number = '+1 641 418 3516'

# 2. Your Emergency Contacts (Must be verified in Twilio Console!)
sos_contacts = [
    '+91 90829 96318', 
    '+91 73047 89964'
]

# 3. The SOS Message & Location
lat = 19.0760
lng = 72.8777
maps_link = f"https://maps.google.com/?q={lat},{lng}"

emergency_message = f"SOS! Om needs help. Loc: {maps_link}"

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
