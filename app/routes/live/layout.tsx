import { Outlet } from "react-router";
import NavBar from "../components/NavBar";
import "./Live.css";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/components/ui/alert-dialog";

export default function Layout() {
	return (
		<>
			<NavBar />
			<div className="bg-crust w-full flex flex-col flex-1 gap-5 md:p-2.5 overflow-hidden live">
				<AlertDialog defaultOpen>
					<AlertDialogContent className="bg-base border-surface-1 text-text">
						<AlertDialogHeader>
							<AlertDialogTitle>Lưu ý!</AlertDialogTitle>
							<AlertDialogDescription className="text-subtext-0">
								Vui lòng không chia sẻ hình ảnh các buổi Live được phát sóng
								trên nền tảng này ở các mạng xã hội một cách công khai.
								<br />
								Trong trường hợp phát hiện được, chúng mình sẽ có các biện pháp
								để xử lý.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogAction className="bg-text text-mantle">Đồng ý</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
				<Outlet />
			</div>
		</>
	);
}
