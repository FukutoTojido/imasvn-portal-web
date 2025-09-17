import {
	index,
	layout,
	type RouteConfig,
	route,
} from "@react-router/dev/routes";

export default [
	layout("routes/layout.tsx", [
		layout("routes/nav.tsx", [
			index("routes/index/page.tsx"),
			route("users/:id", "routes/users/page.tsx"),
			route("posts/:id", "routes/posts/page.tsx"),
			route("calendar", "routes/calendar/page.tsx"),
			route("characters", "routes/calendar/characters/page.tsx"),
		]),
		layout("routes/login/layout.tsx", [
			route("login", "routes/login/page.tsx"),
		]),
		layout("routes/live/layout.tsx", [route("live", "routes/live/page.tsx")]),
		layout("routes/admin/layout.tsx", [
			route("admin", "routes/admin/page.tsx"),
			route("admin/producers", "routes/admin/producers/page.tsx"),
			route("admin/producers/:id", "routes/admin/producers/[id].tsx"),
			route("admin/cards/:id", "routes/admin/cards/page.tsx"),
			route("admin/events", "routes/admin/events.tsx"),
			route("admin/users", "routes/admin/users.tsx"),
			route("admin/live/preview", "routes/admin/live/preview.tsx"),
		]),
	]),
	route("producer-id/:id", "routes/producer-id/page.tsx"),
	route("auth", "routes/auth/index.tsx"),
	route("og/:id", "routes/og/page.tsx"),
] satisfies RouteConfig;
