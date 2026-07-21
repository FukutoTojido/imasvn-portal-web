import { Outlet } from "react-router";
import NavBar from "../components/NavBar";
import "./Live.css";
import { AlertCircleIcon } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	AlertDialogTitle,
} from "~/components/ui/alert-dialog";

export default function Layout() {
	return (
		<>
			<NavBar />
			<div className="bg-crust w-full flex flex-col flex-1 gap-5 md:p-2.5 overflow-hidden live">
				<Outlet />
				<AlertDialog defaultOpen>
					<AlertDialogOverlay className="z-998" />
					<AlertDialogContent className="z-999">
						<AlertDialogHeader>
							<AlertDialogTitle className="flex items-center gap-2">
								<AlertCircleIcon /> Lưu ý!
							</AlertDialogTitle>
							<AlertDialogDescription>
								Vui lòng không chia sẻ hình ảnh các buổi Live trên nền tảng này!
								<br />
								Trong trường hợp phát hiện được, chúng mình sẽ có các biện pháp
								để xử lý.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogAction className="w-full">Đồng ý</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</>
	);
}
