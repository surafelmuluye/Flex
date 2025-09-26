"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border",
        elevated: "border-0 shadow-lg",
        outlined: "border-2 border-border",
        ghost: "border-0 shadow-none",
      },
      interactive: {
        true: "cursor-pointer hover:shadow-md hover:-translate-y-1",
        false: "",
      },
      gradient: {
        none: "",
        subtle: "bg-gradient-to-br from-background to-muted/20",
        primary: "bg-gradient-to-br from-primary-50 to-primary-100/50",
        success: "bg-gradient-to-br from-success-50 to-success-100/50",
        warning: "bg-gradient-to-br from-warning-50 to-warning-100/50",
        error: "bg-gradient-to-br from-error-50 to-error-100/50",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
      gradient: "none",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  loading?: boolean
  shimmer?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, gradient, loading, shimmer, ...props }, ref) => {
    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(
            "rounded-xl border bg-card p-6",
            shimmer && "relative overflow-hidden",
            className
          )}
          {...props}
        >
          {shimmer && (
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          )}
          <div className="space-y-3">
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
            <div className="h-8 w-1/4 bg-muted animate-pulse rounded" />
          </div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, interactive, gradient }), className)}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }


