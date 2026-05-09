import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SearchBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialQuery = new URLSearchParams(location.search).get("search") || "";
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(new URLSearchParams(location.search).get("search") || "");
  }, [location.search]);

  const submit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    navigate({ pathname: "/", search: params.toString() ? `?${params.toString()}` : "" });
  };

  return (
    <form className="navbar-search" onSubmit={submit}>
      <Search size={16} />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search courses, skills, or pathways"
      />
    </form>
  );
}
