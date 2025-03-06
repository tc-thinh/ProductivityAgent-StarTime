import { Category, ConversationMessages } from "./types"

export const mockCategories:  Category[] = [
  {
    "cat_id": 1,
    "cat_color_id": "color1",
    "cat_title": "Work",
    "cat_description": "Tasks related to work",
    "cat_background": "#FFCCCC",
    "cat_foreground": "#000000",
    "cat_active": true,
    "cat_event_prefix": "[WORK]",
    "cat_examples": ["Finish report", "Attend meeting", "Review code"]
  },
  {
    "cat_id": 2,
    "cat_color_id": "color2",
    "cat_title": "Personal",
    "cat_description": "Personal tasks and errands",
    "cat_background": "#CCE5FF",
    "cat_foreground": "#000000",
    "cat_active": true,
    "cat_event_prefix": "[PERSONAL]",
    "cat_examples": ["Buy groceries", "Pick up dry cleaning", "Call mom"]
  },
  {
    "cat_id": 3,
    "cat_color_id": "color3",
    "cat_title": "Health",
    "cat_description": "Fitness and wellness activities",
    "cat_background": "#CCFFCC",
    "cat_foreground": "#000000",
    "cat_active": true,
    "cat_event_prefix": "[HEALTH]",
    "cat_examples": ["Go for a run", "Drink water", "Attend yoga class"]
  },
  {
    "cat_id": 4,
    "cat_color_id": "color4",
    "cat_title": "Education",
    "cat_description": "Learning and skill development",
    "cat_background": "#FFFFCC",
    "cat_foreground": "#000000",
    "cat_active": true,
    "cat_event_prefix": "[EDUCATION]",
    "cat_examples": ["Complete course module", "Study for exams", "Read a book"]
  },
  {
    "cat_id": 5,
    "cat_color_id": "color5",
    "cat_title": "Social",
    "cat_description": "Events and social gatherings",
    "cat_background": "#FFCCFF",
    "cat_foreground": "#000000",
    "cat_active": false,
    "cat_event_prefix": "[SOCIAL]",
    "cat_examples": ["Attend a party", "Meet friends for dinner", "Plan weekend trip"]
  },
  {
    "cat_id": 6,
    "cat_color_id": "color6",
    "cat_title": "Travel",
    "cat_description": "Trips and vacations",
    "cat_background": "#CCCCFF",
    "cat_foreground": "#000000",
    "cat_active": true,
    "cat_event_prefix": "[TRAVEL]",
    "cat_examples": ["Book flight tickets", "Pack luggage", "Plan itinerary"]
  },
  {
    "cat_id": 7,
    "cat_color_id": "color7",
    "cat_title": "Finance",
    "cat_description": "Budgeting and financial planning",
    "cat_background": "#FFE5CC",
    "cat_foreground": "#000000",
    "cat_active": true,
    "cat_event_prefix": "[FINANCE]",
    "cat_examples": ["Pay bills", "Review investment portfolio", "Create budget"]
  },
  {
    "cat_id": 8,
    "cat_color_id": "color8",
    "cat_title": "Hobbies",
    "cat_description": "Creative and recreational activities",
    "cat_background": "#E5CCFF",
    "cat_foreground": "#000000",
    "cat_active": false,
    "cat_event_prefix": "[HOBBIES]",
    "cat_examples": ["Paint a canvas", "Play a musical instrument", "Go hiking"]
  },
  {
    "cat_id": 9,
    "cat_color_id": "color9",
    "cat_title": "Family",
    "cat_description": "Time with family and relatives",
    "cat_background": "#CCE5E5",
    "cat_foreground": "#000000",
    "cat_active": true,
    "cat_event_prefix": "[FAMILY]",
    "cat_examples": ["Dinner with family", "Plan family reunion", "Help sibling move"]
  },
  {
    "cat_id": 10,
    "cat_color_id": "color10",
    "cat_title": "Projects",
    "cat_description": "Personal and professional projects",
    "cat_background": "#E5FFCC",
    "cat_foreground": "#000000",
    "cat_active": true,
    "cat_event_prefix": "[PROJECTS]",
    "cat_examples": ["Complete app prototype", "Write project proposal", "Collaborate with team"]
  },
  {
    "cat_id": 11,
    "cat_color_id": "color11",
    "cat_title": "Miscellaneous",
    "cat_description": "Other uncategorized tasks",
    "cat_background": "#FFCCE5",
    "cat_foreground": "#000000",
    "cat_active": true,
    "cat_event_prefix": "[MISC]",
    "cat_examples": ["Organize files", "Clean workspace", "Schedule dentist appointment"]
  }
];

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
