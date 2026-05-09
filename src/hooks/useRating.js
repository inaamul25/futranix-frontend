export function getCourseRating(id = 1) {
  return 4.2 + (id % 5) * 0.12;
}
