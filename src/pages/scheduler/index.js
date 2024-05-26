import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import Calendar from "../../components/calendar";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { dayjsLocalizer, Views } from "react-big-calendar";
import {
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import {
  useCreateScheduleMutation,
  useLazyGetScheduleQuery,
  useLazyGetAppointmentsQuery,
  useCreateAppointmentMutation,
  useDeleteScheduleMutation,
  useDeleteAppointmentsMutation,
} from "../../store/services";
import ConfirmationModal from "../../components/dataDisplay/ConfirmationModal";
import isEqual from "lodash/isEqual";

const DEFAULT_STEP = 15;
const DEFAULT_VIEW = Views.WEEK;

const Scheduler = () => {
  const [currentMode, setCurrentMode] = useState("provider");
  const [currentEvents, setCurrentEvents] = useState([]);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tempAppointments, setTempAppointments] = useState({});

  const currentView = useRef(Views.WEEK);
  const futureEvent = useRef(null);
  const providerScheduleMap = useRef({});
  const prevProviderScheduleRef = useRef([]);

  const djLocalizer = dayjsLocalizer(dayjs);

  const views = useMemo(
    () => ({
      [Views.MONTH]: true,
      [Views.WEEK]: true,
      [Views.DAY]: true,
    }),
    []
  );

  const [triggerUpdateProvider, { isLoading: isLoadingSetSchedule }] =
    useCreateScheduleMutation();
  const [triggerCreateAppointment, { isLoading: isLoadingCreateAppointment }] =
    useCreateAppointmentMutation();
  const [
    triggerDeleteProviderSchedule,
    { isLoading: isLoadingDeleteProviderSchedule },
  ] = useDeleteScheduleMutation();
  const [
    triggerDeleteClientAppointment,
    { isLoading: isLoadingDeleteClientAppointment },
  ] = useDeleteAppointmentsMutation();
  const [
    triggerGetProviderSchedule,
    { isFetching: isLoadingGetProvider, data: providerSchedule },
  ] = useLazyGetScheduleQuery();
  const [
    triggerGetAppointments,
    { isFetching: isLoadingGetAppointments, data: appointments },
  ] = useLazyGetAppointmentsQuery();

  // Create starting times within the range
  // to be used as a reference for disabling slots outside providers schedule
  const createTimeSlots = (st, end, interval) => {
    let current = dayjs(st);

    while (current.isBefore(end)) {
      providerScheduleMap.current[current.toDate()] = true;
      current = current.add(interval, "minute");
    }
  };

  const updateProviderScheduleMap = useCallback((providerData) => {
    providerScheduleMap.current = {};
    providerData.forEach(({ start, end }) => {
      createTimeSlots(start, end, 15);
    });
  }, []);

  // Fetch provider's or client's data depends on the currentMode.
  const refetch = useCallback(async () => {
    const triggerQeury =
      currentMode === "provider"
        ? triggerGetProviderSchedule
        : triggerGetAppointments;
    try {
      const { data } = await triggerQeury();
      setCurrentEvents(data);
      if (currentMode === "provider") {
        updateProviderScheduleMap(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [
    currentMode,
    triggerGetAppointments,
    triggerGetProviderSchedule,
    updateProviderScheduleMap,
  ]);

  // Refetch when switching between the provider and client views.
  useEffect(() => {
    refetch();
  }, [refetch]);

  // When the component rerenders ( when creating or deleting events ),
  // making sure to have the right reference to show disabled slots and
  // temp appointments.
  useEffect(() => {
    if (currentMode === "provider") {
      if (providerSchedule) {
        const prevProviderSchedule = prevProviderScheduleRef.current;
        prevProviderScheduleRef.current = providerSchedule;

        if (!isEqual(prevProviderSchedule, providerSchedule)) {
          setCurrentEvents(providerSchedule);
          updateProviderScheduleMap(providerSchedule);
        }
      }
    } else {
      if (appointments) {
        const events = [...appointments];

        if (Object.keys(tempAppointments).length) {
          for (let id of Object.keys(tempAppointments)) {
            const event = tempAppointments[id];
            events.push(
              Object.assign({}, event, {
                color: "mediumaquamarine",
                title: "Temp appointment",
                id,
              })
            );
          }
        }
        setCurrentEvents(events);
      }
    }
  }, [
    providerSchedule,
    appointments,
    currentMode,
    tempAppointments,
    updateProviderScheduleMap,
  ]);

  // Clean up the timer.
  useEffect(() => {
    const cleanup = () => {
      for (const id in tempAppointments) {
        clearTimeout(tempAppointments[id].timeout);
      }
    };
    return cleanup;
  }, [tempAppointments]);

  // Used to decided if the new event is 24 hours in advance.
  const isElligibileAppointment = (start) => {
    const now = dayjs();
    const hoursDifference = dayjs(start).diff(now, "hour");
    return hoursDifference >= 24;
  };

  const deleteTempAppointment = (id) => {
    const newTempAppointments = { ...tempAppointments };
    delete newTempAppointments[id];

    setTempAppointments(newTempAppointments);
    setCurrentEvents((prevEvents) =>
      prevEvents.filter((event) => event.id !== id)
    );
  };

  // For client, new appointments should be made 24 hours in advance.
  // Frist, temp appointments are created. They will expire in 30 min if not confirmed.
  // For Provider, new event will be saved on the backend.
  const createEvent = async () => {
    if (futureEvent.current) {
      const { start, end } = futureEvent.current;

      if (currentMode === "client") {
        if (!isElligibileAppointment(start)) {
          alert("Appointment should be made at least 24 hours in advance");
          return;
        } else {
          const id = uuidv4();
          const timer = setTimeout(() => {
            deleteTempAppointment(id);
          }, 30 * 60 * 1000); // 30 minutes in milliseconds
          setTempAppointments((prev) => ({
            ...prev,
            [id]: { start, end, timer },
          }));
          setCurrentEvents((prev) => [
            ...prev,
            {
              id,
              start,
              end,
              color: "mediumaquamarine",
              title: "Temp appointment",
            },
          ]);
        }
      } else {
        try {
          triggerUpdateProvider({
            start,
            end,
          });
        } catch (err) {
          console.error("Err ", err);
        }
      }
    }
  };

  // To have a confirmation for the client's temp appointment to be saved on the backend.
  // After confirming it, the temp appointment is removed and the permanent client's appointment will be displayed.
  const confirmEvent = async () => {
    if (futureEvent.current) {
      const { start, end, id } = futureEvent.current;
      // Delete the event from tempAppontments
      const tempData = { ...tempAppointments };
      delete tempData[id];
      setTempAppointments(tempData);

      try {
        triggerCreateAppointment({ start, end });
      } catch (e) {
        console.error("Err", e);
      }
    }
  };

  // To delete events.
  const deleteEvent = async () => {
    if (futureEvent.current) {
      const { id } = futureEvent.current;
      if (currentMode === "provider") {
        await triggerDeleteProviderSchedule(id).unwrap();
      } else {
        await triggerDeleteClientAppointment(id).unwrap();
      }
      setIsDeleteModalOpen(false);
    }
  };

  // Handling seleted slot.
  // Month view is only for display.
  // Skipping disalbed slots.
  const handleSelectSlot = useCallback(
    ({ start, end }) => {
      if (currentView.current === Views.MONTH) {
        alert("Please use Week or Day view for making schedules");
        return;
      }

      if (currentMode === "client" && !providerScheduleMap.current[start]) {
        return; // Slot is outside provider's schedule for client
      }

      futureEvent.current = { start, end };
      setIsCreationModalOpen(true);
    },
    [currentMode]
  );

  const handleChangeView = (updatedView) => {
    currentView.current = updatedView;
  };

  // When events are clicked,
  // if they are temp appointments, open the modal to get the confirmation of the creation.
  // if they are permanent ones, open the modal to get the confirmation of the deletion.
  const handleSelectEvent = (event) => {
    futureEvent.current = event;
    if (
      Object.keys(tempAppointments).length !== 0 &&
      tempAppointments[event.id]
    ) {
      setIsConfirmModalOpen(true);
    } else {
      setIsDeleteModalOpen(true);
    }
  };

  return (
    <Box sx={{ ".rbc-calendar": { minHeight: "580px" } }}>
      <Stack justifyContent={"end"} direction={"row"} sx={{ margin: 1 }}>
        <FormControl>
          <InputLabel>View</InputLabel>
          <Select
            sx={{ width: "200px" }}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={currentMode}
            label="View"
            onChange={(e) => {
              const {
                target: { value },
              } = e;
              if (value !== currentMode) {
                setCurrentMode(value);
              }
            }}
          >
            <MenuItem value={"provider"}>Provider</MenuItem>
            <MenuItem value={"client"}>Client</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Calendar
        localizer={djLocalizer}
        views={views}
        events={currentEvents}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        step={DEFAULT_STEP}
        defaultView={DEFAULT_VIEW}
        onChangeView={handleChangeView}
        eventPropGetter={(eventList) => {
          if (eventList.color) {
            return { style: { backgroundColor: eventList.color } };
          }
        }}
        // css for blocking slots for the client view.
        slotPropGetter={(slot) => {
          if (currentMode === "client") {
            if (!providerScheduleMap.current[slot]) {
              return {
                className: "rbc-off-range-bg",
              };
            }
          }
        }}
      />

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={
          isLoadingGetAppointments ||
          isLoadingGetProvider ||
          isLoadingCreateAppointment ||
          isLoadingSetSchedule ||
          isLoadingDeleteClientAppointment ||
          isLoadingDeleteProviderSchedule
        }
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <ConfirmationModal
        isOpen={isCreationModalOpen}
        setIsOpen={setIsCreationModalOpen}
        title="Are you sure to create this event?"
        onConfirm={() => {
          setIsCreationModalOpen(false);
          createEvent();
        }}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        setIsOpen={setIsConfirmModalOpen}
        title="Are you sure to confirm this event?"
        onConfirm={() => {
          setIsConfirmModalOpen(false);
          confirmEvent();
        }}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        title="Are you sure to delete this event?"
        onConfirm={() => {
          setIsConfirmModalOpen(false);
          deleteEvent();
        }}
        confirmationText="Delete"
      />
    </Box>
  );
};

export default Scheduler;
