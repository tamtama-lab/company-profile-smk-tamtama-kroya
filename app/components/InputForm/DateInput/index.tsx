"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { BiCalendar } from "react-icons/bi";
import { IoClose } from "react-icons/io5";

dayjs.locale("id");

interface DateInputProps {
  label: string;
  name: string;
  value?: string; // format: YYYY-MM-DD
  onChange: (date: Date | undefined) => void;
  isMandatory?: boolean;
  placeholder?: string;
  max?: string;
  min?: string;
  startYear?: number;
  endYear?: number;
}

export const DateInput: React.FC<DateInputProps> = ({
  label,
  name,
  value,
  onChange,
  isMandatory = false,
  placeholder,
  max,
  min,
  startYear = 2000,
  endYear = 2040,
}) => {
  const [open, setOpen] = React.useState(false);

  const selectedDate = value ? dayjs(value, "YYYY-MM-DD").toDate() : undefined;

  const minDate = min
    ? dayjs(min, "YYYY-MM-DD").startOf("day").toDate()
    : undefined;
  const maxDate = max
    ? dayjs(max, "YYYY-MM-DD").endOf("day").toDate()
    : undefined;

  return (
    <div className="w-full rounded-md">
      {/* Label */}
      <label
        htmlFor={name}
        className="block text-sm max-sm:text-xs font-semibold text-gray-700 mb-2"
      >
        {label} {isMandatory && <span className="text-red-500">*</span>}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className="">
          <button
            // variant="link"
            id={name}
            className="w-full flex flex-row border border-gray-300 justify-start text-left px-4 py-2 max-sm:py-1 rounded-sm font-normal"
          >
            <div className="w-full max-sm:text-xs flex items-center">
              {" "}
              {selectedDate ? (
                dayjs(selectedDate).locale("id-ID").format("dddd, DD MMMM YYYY")
              ) : (
                <p className="text-gray-400">
                  {placeholder || "Pilih tanggal"}
                </p>
              )}
            </div>
            {selectedDate ? (
              <IoClose
                className="text-2xl"
                onClick={() => onChange(undefined)}
              />
            ) : (
              <BiCalendar className="text-2xl" />
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" align="start">
          <Calendar
            className="border-none"
            mode="single"
            selected={selectedDate}
            defaultMonth={selectedDate}
            captionLayout="dropdown"
            fromYear={startYear}
            toYear={endYear}
            toDate={max ? dayjs(max, "YYYY-MM-DD").toDate() : undefined}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            onSelect={(date) => {
              if (!date) return;
              if (minDate && date < minDate) return;
              if (maxDate && date > maxDate) return;

              const fixedDate = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                12, // jam 12 siang, anti geser
              );

              onChange(fixedDate);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
