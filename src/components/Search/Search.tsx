import {
  Box,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  type BoxProps,
} from "@chakra-ui/react";
import { FormEvent, useEffect, useState } from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { allLessonsPagePath } from "src/data/pageUrl";

export const Search = ({
  mb = 0,
  onPage = false,
}: {
  mb?: BoxProps["mb"];
  /** Inline on a grey page background rather than in the white top bar. */
  onPage?: boolean;
}) => {
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
    <Box
      as="form"
      role="search"
      mb={mb}
      w="full"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        searchLessons(query.trim(), isLessonsPage);
      }}
    >
      <InputGroup>
        <InputLeftElement pointerEvents="none" h="full" pl="1">
          <Icon as={HiOutlineMagnifyingGlass} boxSize={5} color="ink.400" />
        </InputLeftElement>
        <Input
          type="search"
          h="44px"
          pl="12"
          bg={onPage ? "white" : "ink.50"}
          borderColor={onPage ? "ink.200" : "transparent"}
          borderRadius="full"
          fontSize="sm"
          placeholder="Search your lessons"
          aria-label="Search your lessons"
          _hover={{ borderColor: "ink.200" }}
          _focus={{ bg: "white" }}
          value={query}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            if (isLessonsPage) searchLessons(value, true);
          }}
        />
      </InputGroup>
    </Box>
  );
};
