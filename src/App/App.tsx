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
import { SetStateAction, memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SpringValue, animated, useSpring } from "react-spring";
import "./App.css";

function useIncomeCalculator() {
  const [income, setIncome] = useState(125000);
  const [frequency, setFrequency] = useState("annually");
  const [text, setText] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [counter, setCounter] = useState(0);
  const [weeksWorked, setWeeksWorked] = useState(52);
  const [hoursPerWeek, setHoursPerWeek] = useState(38);

  return {
    income,
    setIncome,
    frequency,
    setFrequency,
    text,
    setText,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    counter,
    setCounter,
    weeksWorked,
    setWeeksWorked,
    hoursPerWeek,
    setHoursPerWeek,
  };
}

const AnimatedCounter = memo(
  ({ counter }: { counter: SpringValue<number> }) => (
    <animated.div>{counter.to((val) => val.toFixed(2))}</animated.div>
  )
);

export function App() {
  const {
    income,
    setIncome,
    frequency,
    setFrequency,
    text,
    setText,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    counter,
    setCounter,
    weeksWorked,
    setWeeksWorked,
    hoursPerWeek,
    setHoursPerWeek,
  } = useIncomeCalculator();

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
      const earningsPerWeek = income / weeksWorked;
      const earningsPerHour = earningsPerWeek / hoursPerWeek;
      const earningsPerMinute = earningsPerHour / 60;
      const earningsPerSecond = earningsPerMinute / 60;

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
      const currentEarnings = earningsPerSecond * timeElapsedInSeconds;

      if (isAfter(new Date(), end)) {
        setText(
          `🏝️ End of the day, total earned: $${Number(
            (earningsPerHour * hoursPerWeek) / 5
          )}`
        );
        setCounter(Number((earningsPerHour * hoursPerWeek) / 5));
      } else {
        setText("Working... 👨‍🌾");
        setCounter(Math.abs(Number(currentEarnings)));
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [
    income,
    frequency,
    startTime,
    endTime,
    weeksWorked,
    hoursPerWeek,
    setText,
    setCounter,
  ]);

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
                $<AnimatedCounter counter={props.counter} />
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
