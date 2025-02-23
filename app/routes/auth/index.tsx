import Cookie from "universal-cookie";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

export const setCookies = ({
	access_token,
	refresh_token,
	atExpire,
	rtExpire,
}: {
	access_token: string;
	refresh_token: string;
	atExpire: string;
	rtExpire: string;
}) => {
	const cookie = new Cookie(null);
	cookie.set("access_token", access_token, {
		expires: new Date(+atExpire),
		secure: true,
		sameSite: "lax",
		path: "/",
	});

	cookie.set("refresh_token", refresh_token, {
		expires: new Date(+rtExpire),
		secure: true,
		sameSite: "lax",
		path: "/",
	});
};

export default function Page() {
	const [searchParams] = useSearchParams();

	useEffect(() => {
		const access_token = searchParams.get("at");
		const refresh_token = searchParams.get("rt");
		const atExpire = searchParams.get("atExpire");
		const rtExpire = searchParams.get("rtExpire");

		if (!access_token || !refresh_token || !atExpire || !rtExpire) return;

		setCookies({
			access_token,
			refresh_token,
			atExpire,
			rtExpire,
		});

		window.location.href = "/";
	}, [searchParams]);

	return "";
}
