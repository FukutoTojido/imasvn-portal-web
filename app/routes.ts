import {
	type RouteConfig,
	index,
	layout,
	route,
} from "@react-router/dev/routes";

export default [
	layout("routes/layout.tsx", [
		layout("routes/nav.tsx", [
			index("routes/index/page.tsx"),
			route("users/:id", "routes/users/page.tsx"),
			route("posts/:id", "routes/posts/page.tsx"),
			route("live/preview", "routes/live/preview/page.tsx"),
			route("/calendar", "routes/calendar/page.tsx"),
			route("/characters", "routes/calendar/characters/page.tsx"),
		]),
		layout("routes/login/layout.tsx", [
			route("login", "routes/login/page.tsx"),
		]),
		layout("routes/live/layout.tsx", [route("live", "routes/live/page.tsx")]),
	]),
	route("auth", "routes/auth/index.tsx"),
] satisfies RouteConfig;
