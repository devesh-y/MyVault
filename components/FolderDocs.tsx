import {ContextMenu} from "@radix-ui/themes";
import {ReactNode} from "react";

export const FolderDocs=({children}:{children:ReactNode})=>{
	return <ContextMenu.Root>
		<ContextMenu.Trigger >
			{children}
		</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.Item shortcut="⌘ E">Rename</ContextMenu.Item>
			<ContextMenu.Item shortcut="⌘ D">Folder Info</ContextMenu.Item>
			<ContextMenu.Separator />
			<ContextMenu.Item shortcut="⌘ ⌫" color="red">
				Delete
			</ContextMenu.Item>
		</ContextMenu.Content>
	</ContextMenu.Root>
}