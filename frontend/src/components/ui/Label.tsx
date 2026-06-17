import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  uppercase?: boolean
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, uppercase = true, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-xs font-medium text-textMuted',
        uppercase && 'uppercase tracking-wider',
        className,
      )}
      {...props}
    />
  ),
)
Label.displayName = 'Label'
