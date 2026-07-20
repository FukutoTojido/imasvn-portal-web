"use client"
 
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
 
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
 
export function DatePicker({
	date,
	setDate,
	className
}: {
	date: Date | undefined;
	setDate: (date: Date | undefined) => void; 
	className?: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className={cn("w-[280px] justify-start text-left font-normal data-[empty=true]:text-muted-foreground", className)}
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} defaultMonth={date} />
      </PopoverContent>
    </Popover>
  )
}