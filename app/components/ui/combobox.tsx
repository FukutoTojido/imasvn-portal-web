import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
 
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
 
const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
]

type ComboBoxProps = {
    options?: {
        value: string,
        label: string
    }[],
    onValueChange?: (value: string) => void,
    placeholder?: string,
    defaultValue: string
}

export function ComboBox({ options = [], onValueChange, placeholder, defaultValue }: ComboBoxProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(defaultValue ?? "")
 
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between bg-mantle border-surface-1 hover:bg-base hover:text-text font-normal", !!value ? "text-text" : "text-subtext-0")}
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder ?? ""}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 border-surface-1 bg-mantle">
        <Command className="bg-mantle text-text">
          <CommandInput placeholder={placeholder ?? ""} className="placeholder:text-subtext-0" />
          <CommandList>
            <CommandEmpty>It's empty here</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  keywords={[option.label]}
                  onSelect={(currentValue) => {
                    setValue(value === currentValue ? "" : currentValue);
                    setOpen(false);
                    onValueChange?.(currentValue)
                  }}
                  className="text-text data-[selected=true]:bg-surface-0 data-[selected=true]:text-text "
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4 text-text",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}