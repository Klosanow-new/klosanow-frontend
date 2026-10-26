import { Box, Button, Input } from "@chakra-ui/react";
import { FormEvent, useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { allLessonsPagePath } from "src/data/pageUrl";

export const Search = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const isLessonsPage = pathname === allLessonsPagePath;
  const searchQuery = isLessonsPage ? searchParams.get("q") || "" : "";
  const [query, setQuery] = useState(searchQuery);

  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery, pathname]);

  const searchLessons = (value: string, replace = false) => {
    const params = new URLSearchParams(isLessonsPage ? searchParams : undefined);
    if (value) params.set("q", value);
    else params.delete("q");

    navigate(
      { pathname: allLessonsPagePath, search: params.toString() },
      { replace }
    );
  };

  return (
    <Box mb={5}>
      <Box
        as="form"
        role="search"
        className="search"
        width="full"
        position="relative"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          searchLessons(query.trim(), isLessonsPage);
        }}>
        <Button
          type="submit"
          aria-label="Search lessons"
          position="absolute"
          zIndex={1}
          top="0px"
          left="-5px"
          border="none"
          cursor="pointer"
          background="transparent"
        >
          <CiSearch color="#333" fontSize="1.5rem" />
        </Button>

        <Input
          paddingX={10}
          width="100%"
          background="transparent"
          type="text"
          variant="outline"
          color="black.50"
          placeholder="Search for a lesson"
          aria-label="Search for a lesson"
          value={query}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            if (isLessonsPage) searchLessons(value, true);
          }}
          _placeholder={{ fontSize: "14px" }}
        />
      </Box>
    </Box>
  );
};
