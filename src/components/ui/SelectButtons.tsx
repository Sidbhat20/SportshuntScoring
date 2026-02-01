'use client'

type SelectOption = {
  value: string | number
  label: string
}

type SelectButtonsProps = {
  options: SelectOption[]
  value: string | number
  onChange: (value: string | number) => void
  label?: string
}

export function SelectButtons({ options, value, onChange, label }: SelectButtonsProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium uppercase tracking-wide text-text-muted mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              px-4 py-2 min-h-[44px] rounded-lg font-medium
              ${value === option.value
                ? 'bg-action-primary text-white'
                : 'bg-action-secondary text-text-primary hover:bg-gray-200'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
