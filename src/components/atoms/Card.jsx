import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ 
  children, 
  className, 
  hover = false,
  ...props 
}, ref) => {
  const Component = hover ? motion.div : "div";
  
  return (
    <Component
      ref={ref}
      whileHover={hover ? { y: -2, scale: 1.02 } : {}}
      transition={{ duration: 0.2 }}
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100 transition-shadow duration-200",
        hover && "hover:shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = "Card";

export default Card;