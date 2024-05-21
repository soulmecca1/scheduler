# React Scheduler App

## Available Scripts

First, install the packages by running:

### `npm install`

In the project directory, you can run:

### `npm start`

Runs the app in development mode.  
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.  
You may also see any lint errors in the console.

### `npm test`

Runs the test suite.  
**Note:** Only default tests exist due to time constraints.

## Features

### Switch Views

Use the dropdown selector at the top right to switch between `Provider` and `Client` views.

### Provider's View

- Click on a time slot or click and drag to select multiple slots to create an event.
- After confirmation, the event is saved on the backend and the data is refetched to display the new records.
- Click an existing event to delete it.

### Client's View

- Disabled slots are greyed out (according to the Provider's schedule).
- Available slots are white.
- Click an available slot or click and drag down an available slot to create an appointment.
- When a client's event is first created, it will be a temporary appointment that will expire in 30 minutes if not confirmed (temporary appointments are colored light green).
- Click a temporary appointment to confirm and save it on the backend.
- Click an existing appointment (purple ones) to delete it.
- Temporary appointments that are not confirmed within 30 minutes will disappear from the calendar.

### Backend

- https://mockapi.io/ is used for the mock api

## Future Advancements

#### Support multiple providers and clients

- Currently only supporting one provider and client.

#### Tests

- Tests are not written due to time constraints.

#### Error handling

- Better error handling needed.

#### Support TypeScript

- Having strict types is beneficial.

#### Test app on mobile

- Although the app is designed to be mobile-friendly, optimizing and testing it on actual devices will be beneficial.

#### Support accessibility

- Implement features such as keyboard navigation, semantic HTML, and ARIA attributes to improve accessibility.

#### Support edge cases

- Ensure consistent updates on the client side when a provider changes the schedule.
