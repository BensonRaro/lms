import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  // Nav destinations that are still being built; swap for real pages as they land.
  route("courses", "routes/soon.tsx", { id: "routes/courses" }),
  route("instructors", "routes/soon.tsx", { id: "routes/instructors" }),
  route("pricing", "routes/soon.tsx", { id: "routes/pricing" }),
  route("about", "routes/soon.tsx", { id: "routes/about" }),
  layout("routes/auth/layout.tsx", [
    route("login", "routes/auth/login.tsx"),
    route("signup", "routes/auth/signup.tsx"),
  ]),
  route("become-instructor", "routes/become-instructor.tsx"),
  layout("routes/dashboard/layout.tsx", [
    route("dashboard/instructor", "routes/dashboard/instructor.tsx"),
    route("dashboard/instructor/courses", "routes/dashboard/courses.tsx"),
    route(
      "dashboard/instructor/courses/:courseId",
      "routes/dashboard/course-editor.tsx",
    ),
  ]),
] satisfies RouteConfig;
