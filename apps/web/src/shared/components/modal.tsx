import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/shared/components/dialog"
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger
} from "@/shared/components/drawer"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from "@/shared/components/sheet"
import { useIsMobile } from "@/shared/hooks/use-mobile"
import type * as RadixDialogPrimitive from "@radix-ui/react-dialog"
import { type ReactNode, createContext, useContext } from "react"
import type * as React from "react"

type ComponentType = "drawer" | "sheet" | "dialog"

interface ModalContextValue {
	componentType: ComponentType
}

const ModalContext = createContext<ModalContextValue | null>(null)

function useModalContext(): ModalContextValue {
	const context = useContext(ModalContext)
	if (context === null) {
		throw new Error("Modal components must be used within a Modal")
	}
	return context
}

type CommonProps = {
	children: ReactNode
}

type ModalProps =
	| (React.ComponentProps<typeof Dialog> & CommonProps & { desktopComponent: "dialog" })
	| (React.ComponentProps<typeof Sheet> & CommonProps & { desktopComponent?: "sheet" })
	| (React.ComponentProps<typeof Drawer> & CommonProps & { desktopComponent?: never })

export function Modal({ children, desktopComponent = "sheet", ...rest }: ModalProps) {
	const isMobile = useIsMobile()
	const componentType: ComponentType = isMobile ? "drawer" : desktopComponent

	const RootComponent =
		componentType === "drawer" ? Drawer : componentType === "dialog" ? Dialog : Sheet

	return (
		<ModalContext.Provider value={{ componentType }}>
			<RootComponent {...rest}>{children}</RootComponent>
		</ModalContext.Provider>
	)
}

type TriggerProps = React.ComponentProps<typeof RadixDialogPrimitive.Trigger> & {
	children: ReactNode
}

export function ModalTrigger({ children, ...props }: TriggerProps) {
	const { componentType } = useModalContext()
	switch (componentType) {
		case "drawer":
			return <DrawerTrigger {...props}>{children}</DrawerTrigger>
		case "dialog":
			return <DialogTrigger {...props}>{children}</DialogTrigger>
		case "sheet":
			return <SheetTrigger {...props}>{children}</SheetTrigger>
	}
}

type ContentProps = React.ComponentProps<typeof RadixDialogPrimitive.Content> & {
	children: ReactNode
}

export function ModalContent({ children, ...props }: ContentProps) {
	const { componentType } = useModalContext()
	switch (componentType) {
		case "drawer":
			return <DrawerContent {...props}>{children}</DrawerContent>
		case "dialog":
			return <DialogContent {...props}>{children}</DialogContent>
		case "sheet":
			return <SheetContent {...props}>{children}</SheetContent>
	}
}

type HeaderProps = {
	children: ReactNode
}

export function ModalHeader({ children }: HeaderProps) {
	const { componentType } = useModalContext()
	switch (componentType) {
		case "drawer":
			return <DrawerHeader>{children}</DrawerHeader>
		case "dialog":
			return <DialogHeader>{children}</DialogHeader>
		case "sheet":
			return <SheetHeader>{children}</SheetHeader>
	}
}

type TitleProps = {
	children: ReactNode
}

export function ModalTitle({ children }: TitleProps) {
	const { componentType } = useModalContext()
	switch (componentType) {
		case "drawer":
			return <DrawerTitle>{children}</DrawerTitle>
		case "dialog":
			return <DialogTitle>{children}</DialogTitle>
		case "sheet":
			return <SheetTitle>{children}</SheetTitle>
	}
}

type DescriptionProps = {
	children: ReactNode
}

export function ModalDescription({ children }: DescriptionProps) {
	const { componentType } = useModalContext()
	switch (componentType) {
		case "drawer":
			return <DrawerDescription>{children}</DrawerDescription>
		case "dialog":
			return <DialogDescription>{children}</DialogDescription>
		case "sheet":
			return <SheetDescription>{children}</SheetDescription>
	}
}

type FooterProps = {
	children: ReactNode
}

export function ModalFooter({ children }: FooterProps) {
	const { componentType } = useModalContext()
	switch (componentType) {
		case "drawer":
			return <DrawerFooter>{children}</DrawerFooter>
		case "dialog":
			return <DialogFooter>{children}</DialogFooter>
		case "sheet":
			return <SheetFooter>{children}</SheetFooter>
	}
}
