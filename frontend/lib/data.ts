import { Category, ConversationMessages } from "./types"

export const mockCategories:  Category[] = [
  {
    "c_id": 1,
    "c_color_id": "color1",
    "c_title": "Work",
    "c_description": "Tasks related to work",
    "c_background": "#FFCCCC",
    "c_foreground": "#000000"
  },
  {
    "c_id": 2,
    "c_color_id": "color2",
    "c_title": "Personal",
    "c_description": "Personal tasks and errands",
    "c_background": "#CCE5FF",
    "c_foreground": "#000000"
  },
  {
    "c_id": 3,
    "c_color_id": "color3",
    "c_title": "Health",
    "c_description": "Fitness and wellness activities",
    "c_background": "#CCFFCC",
    "c_foreground": "#000000"
  },
  {
    "c_id": 4,
    "c_color_id": "color4",
    "c_title": "Education",
    "c_description": "Learning and skill development",
    "c_background": "#FFFFCC",
    "c_foreground": "#000000"
  },
  {
    "c_id": 5,
    "c_color_id": "color5",
    "c_title": "Social",
    "c_description": "Events and social gatherings",
    "c_background": "#FFCCFF",
    "c_foreground": "#000000"
  },
  {
    "c_id": 6,
    "c_color_id": "color6",
    "c_title": "Travel",
    "c_description": "Trips and vacations",
    "c_background": "#CCCCFF",
    "c_foreground": "#000000"
  },
  {
    "c_id": 7,
    "c_color_id": "color7",
    "c_title": "Finance",
    "c_description": "Budgeting and financial planning",
    "c_background": "#FFE5CC",
    "c_foreground": "#000000"
  },
  {
    "c_id": 8,
    "c_color_id": "color8",
    "c_title": "Hobbies",
    "c_description": "Creative and recreational activities",
    "c_background": "#E5CCFF",
    "c_foreground": "#000000"
  },
  {
    "c_id": 9,
    "c_color_id": "color9",
    "c_title": "Family",
    "c_description": "Time with family and relatives",
    "c_background": "#CCE5E5",
    "c_foreground": "#000000"
  },
  {
    "c_id": 10,
    "c_color_id": "color10",
    "c_title": "Projects",
    "c_description": "Personal and professional projects",
    "c_background": "#E5FFCC",
    "c_foreground": "#000000"
  },
  {
    "c_id": 11,
    "c_color_id": "color11",
    "c_title": "Miscellaneous",
    "c_description": "Other uncategorized tasks",
    "c_background": "#FFCCE5",
    "c_foreground": "#000000"
  }
]

export const mockConversation1: ConversationMessages = {
  "conversationId": 1,
  "message": [
    {
        "role": "system",
        "content": "\n            As an event assistant bot, use your predefined tools to create events based on user input. \n            The current datetime is 2025-03-02T22:37:11.340466. The current timezone is America/Phoenix.\n\n            # Notes\n            - Ensure the time zone context is accounted for when scheduling events.\n            - If the user provides incomplete information, go ahead and create the event with every information you have. Leave the uncertain information blank.\n        "
    },
    {
        "role": "user",
        "content": "[TEXT]: Set a blocker from 8-9AM tomorrow to demo to Mia Vo about my start-up idea - StarTime.\n"
    },
    {
        "role": "assistant",
        "content": "",
        "tool_calls": [
          {
            "id": "call_9PQeuR51PDIXZpFa5RXnUm5w",
            "function": {
              "arguments": "{\"event\":{\"start\":{\"dateTime\":\"2025-03-03T08:00:00-07:00\",\"timeZone\":\"America/Phoenix\"},\"end\":{\"dateTime\":\"2025-03-03T09:00:00-07:00\",\"timeZone\":\"America/Phoenix\"},\"summary\":\"Demo to Mia Vo about StarTime\",\"description\":\"Blocker to demo my start-up idea, StarTime, to Mia Vo.\",\"location\":\"\",\"attendees\":[{\"email\":\"mia.vo@example.com\",\"displayName\":\"Mia Vo\"}],\"reminders\":{\"useDefault\":true,\"overrides\":[]},\"colorId\":\"0\",\"recurrence\":[]}, \"calendarId\":\"primary\"}",
              "name": "CreateCalendarEvent"
            },
            "type": "function"
          }
        ]
    },
    {
        "role": "tool",
        "tool_call_id": "call_9PQeuR51PDIXZpFa5RXnUm5w",
        "content": "{'kind': 'calendar#event', 'etag': '\"3481960495261406\"', 'id': 'kvlfm9m8a87kp3jngn5d07l80o', 'status': 'confirmed', 'htmlLink': 'https://www.google.com/calendar/event?eid=a3ZsZm05bThhODdrcDNqbmduNWQwN2w4MG8gdGhpbmgudHJhbi5pbmJveEBt', 'created': '2025-03-03T05:37:27.000Z', 'updated': '2025-03-03T05:37:27.630Z', 'summary': 'Demo to Mia Vo about StarTime', 'description': 'Blocker to demo my start-up idea, StarTime, to Mia Vo.', 'creator': {'email': 'thinh.tran.inbox@gmail.com', 'self': True}, 'organizer': {'email': 'thinh.tran.inbox@gmail.com', 'self': True}, 'start': {'dateTime': '2025-03-03T08:00:00-07:00', 'timeZone': 'America/Phoenix'}, 'end': {'dateTime': '2025-03-03T09:00:00-07:00', 'timeZone': 'America/Phoenix'}, 'iCalUID': 'kvlfm9m8a87kp3jngn5d07l80o@google.com', 'sequence': 0, 'attendees': [{'email': 'mia.vo@example.com', 'displayName': 'Mia Vo', 'responseStatus': 'needsAction'}], 'reminders': {'useDefault': True}, 'eventType': 'default'}"
    },
    {
        "role": "assistant",
        "content": "The event \"Demo to Mia Vo about StarTime\" has been successfully scheduled for tomorrow from 8:00 AM to 9:00 AM (America/Phoenix time). Mia Vo has been invited to the event."
    }
  ]
}

export const mockConversation2: ConversationMessages = {
  "conversationId": 2,
  "message": [
    {
        "role": "system",
        "content": "\n            As an event assistant bot, use your predefined tools to create events based on user input. \n            The current datetime is 2025-03-02T22:44:23.450438. The current timezone is America/Phoenix.\n\n            # Notes\n            - Ensure the time zone context is accounted for when scheduling events.\n            - If the user provides incomplete information, go ahead and create the event with every information you have. Leave the uncertain information blank.\n        "
    },
    {
        "role": "user",
        "content": "[TEXT]: Set a blocker for 12-1PM tomorrow for my Data Structure and Algorithm class.\n"
    },
    {
        "role": "assistant",
        "content": "",
        "tool_calls": [
          {
            "id": "",
            "function": {
              "arguments": "{\"event\":{\"start\":{\"dateTime\":\"2025-03-03T12:00:00-07:00\",\"timeZone\":\"America/Phoenix\"},\"end\":{\"dateTime\":\"2025-03-03T13:00:00-07:00\",\"timeZone\":\"America/Phoenix\"},\"summary\":\"Data Structure and Algorithm Class\",\"description\":\"\",\"location\":\"\",\"attendees\":[],\"reminders\":{\"useDefault\":true,\"overrides\":[]},\"colorId\":\"0\",\"recurrence\":[]},\"calendarId\":\"primary\"}",
              "name": "CreateCalendarEvent"
            },
            "type": "function"
          }
        ]
    },
    {
        "role": "tool",
        "tool_call_id": "call_vYXoctsDsU4nYU36Z3ayfVug",
        "content": "{'kind': 'calendar#event', 'etag': '\"3481961341605278\"', 'id': 'isfe0k2u1234bvtsv11iqngun0', 'status': 'confirmed', 'htmlLink': 'https://www.google.com/calendar/event?eid=aXNmZTBrMnUxMjM0YnZ0c3YxMWlxbmd1bjAgdGhpbmgudHJhbi5pbmJveEBt', 'created': '2025-03-03T05:44:30.000Z', 'updated': '2025-03-03T05:44:30.802Z', 'summary': 'Data Structure and Algorithm Class', 'creator': {'email': 'thinh.tran.inbox@gmail.com', 'self': True}, 'organizer': {'email': 'thinh.tran.inbox@gmail.com', 'self': True}, 'start': {'dateTime': '2025-03-03T12:00:00-07:00', 'timeZone': 'America/Phoenix'}, 'end': {'dateTime': '2025-03-03T13:00:00-07:00', 'timeZone': 'America/Phoenix'}, 'iCalUID': 'isfe0k2u1234bvtsv11iqngun0@google.com', 'sequence': 0, 'reminders': {'useDefault': True}, 'eventType': 'default'}"
    },
    {
        "role": "assistant",
        "content": "The event \"Data Structure and Algorithm Class\" has been successfully scheduled for tomorrow from 12:00 PM to 1:00 PM (America/Phoenix time)."
    }
  ]  
}

export const mockPromptSuggestions: string[] = [
  "Quick overview of my schedule for today",
  "Add an event: "
]
