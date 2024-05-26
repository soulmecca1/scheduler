import {
  Calendar as ReactBigCalendar,
  Views,
  dayjsLocalizer,
} from "react-big-calendar";
import dayjs from "dayjs";
import { useMemo } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dayjsLocalizer(dayjs);

const CALENDAR_STEP = 15;
const CALENDAR_MIN_HOUR = 7;
const CALENDAR_MAX_HOUR = 20;

const Calendar = ({ defaultView, onChangeView, ...props }) => {
  const {
    defaultDate,
    max,
    views,
    min,
    events,
    onSelectEvent,
    onSelectSlot,
    step,
    scrollToTime,
  } = useMemo(
    () => ({
      defaultDate: props.defaultDate || new Date(),
      min:
        props.min ||
        dayjs().set("hour", CALENDAR_MIN_HOUR).minute(0).second(0).toDate(),
      max:
        props.max ||
        dayjs().set("hour", CALENDAR_MAX_HOUR).minute(0).second(0).toDate(),
      views: props.views || Object.keys(Views).map((k) => Views[k]),
      events: props.events || [],
      onSelectSlot: props.onSelectSlot,
      onSelectEvent: props.onSelectEvent,
      step: props.step || CALENDAR_STEP,
      scrollToTime:
        props.scrollToTime ||
        dayjs()
          .subtract(CALENDAR_STEP * 2, "minutes")
          .toDate(),
    }),
    [
      props.defaultDate,
      props.min,
      props.max,
      props.views,
      props.events,
      props.onSelectSlot,
      props.onSelectEvent,
      props.step,
      props.scrollToTime,
    ]
  );

  // This is used to remove the time range from the calendar slot
  const { formats } = useMemo(
    () => ({
      formats: {
        eventTimeRangeFormat: () => "",
      },
    }),
    []
  );

  return (
    <ReactBigCalendar
      defaultDate={defaultDate}
      events={events}
      max={max}
      min={min}
      step={step}
      views={views}
      onView={onChangeView}
      onSelectEvent={onSelectEvent}
      onSelectSlot={onSelectSlot}
      defaultView={defaultView}
      localizer={localizer}
      selectable={true}
      timeslots={1}
      dayLayoutAlgorithm={"no-overlap"}
      showAllEvents={false}
      scrollToTime={scrollToTime}
      formats={formats}
      {...props}
    />
  );
};

export default Calendar;
