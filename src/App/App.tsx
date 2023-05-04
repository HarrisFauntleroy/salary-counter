import { SetStateAction, useEffect, useState } from "react";

import divide from "lodash/divide";
import multiply from "lodash/multiply";

import {
  AbsoluteCenter,
  Center,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
} from "@chakra-ui/react";
import { differenceInSeconds, isAfter } from "date-fns";
import { useTranslation } from "react-i18next";
import { animated, useSpring } from "react-spring";

import "./App.css";

export function App() {
  const [income, setIncome] = useState(125000);
  const [frequency, setFrequency] = useState("annually");
  const [text, setText] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [counter, setCounter] = useState(0);
  const [weeksWorked, setWeeksWorked] = useState(52);
  const [hoursPerWeek, setHoursPerWeek] = useState(38);

  const handleIncomeChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setIncome(Number(e.target.value));
  };

  const handleFrequencyChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setFrequency(e.target.value);
  };

  const handleWeeksWorkedChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setWeeksWorked(Number(e.target.value));
  };

  const handleHoursPerWeekChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setHoursPerWeek(Number(e.target.value));
  };

  const handleStartTimeChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setStartTime(e.target.value);
  };

  const handleEndTimeChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setEndTime(e.target.value);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const earningsPerWeek = divide(income, weeksWorked);
      const earningsPerHour = divide(earningsPerWeek, hoursPerWeek);
      const earningsPerMinute = divide(earningsPerHour, 60);
      const earningsPerSecond = divide(earningsPerMinute, 60);

      const currentDate = new Date();
      const start = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        Number(...startTime.split(":"))
      );
      const end = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        Number(...endTime.split(":"))
      );

      const timeElapsedInSeconds = differenceInSeconds(start, new Date());
      const currentEarnings = multiply(earningsPerSecond, timeElapsedInSeconds);

      // It could possibly reflect the time of day using emojis as well such as sunrise, sunset, morning, evening, night, sleeping, working, etc,

      if (isAfter(new Date(), end)) {
        setText(
          `🏝️ End of the day, total earned: $${Number(
            divide(multiply(earningsPerHour, hoursPerWeek), 5)
          )}`
        );
        setCounter(Number(divide(multiply(earningsPerHour, hoursPerWeek), 5)));
      } else {
        setText("Working... 👨‍🌾");
        setCounter(Math.abs(Number(currentEarnings)));
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [income, frequency, startTime, endTime, weeksWorked, hoursPerWeek]);

  const props = useSpring({
    from: { counter: 0 },
    to: { counter },
  });

  const { t } = useTranslation();

  return (
    <AbsoluteCenter>
      <Stack>
        <Center padding="16px">
          <Stack>
            <Flex>
              <Heading style={{ display: "flex", flexDirection: "row" }}>
                $
                <animated.div>
                  {props.counter.to((val) => val.toFixed(2))}
                </animated.div>
              </Heading>
              {t("Translated Text")}
            </Flex>
            <Heading>{text}</Heading>
          </Stack>
        </Center>
        <Divider />
        <Center padding="16px">
          <Stack>
            <FormControl>
              <FormLabel>Income:</FormLabel>
              <Input
                type="number"
                value={income}
                onChange={handleIncomeChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Frequency:</FormLabel>
              <Select value={frequency} onChange={handleFrequencyChange}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Weeks worked per year: </FormLabel>
              <Input
                type="number"
                value={weeksWorked}
                onChange={handleWeeksWorkedChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Hours per week: </FormLabel>
              <Input
                type="number"
                value={hoursPerWeek}
                onChange={handleHoursPerWeekChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Start Time: </FormLabel>
              <Input
                type="time"
                value={startTime}
                onChange={handleStartTimeChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>End Time: </FormLabel>
              <Input
                type="time"
                value={endTime}
                onChange={handleEndTimeChange}
              />
            </FormControl>
          </Stack>
        </Center>
      </Stack>
    </AbsoluteCenter>
  );
}
