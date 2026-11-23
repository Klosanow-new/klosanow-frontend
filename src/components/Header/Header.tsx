import { Flex, Heading, Icon, IconButton } from "@chakra-ui/react";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { headerInterface } from "../../types/components/componetInterface";

/** Mobile page header: back button + title. Desktop pages render their own. */
const Header = ({ pageName, link }: headerInterface) => {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(link || "/dashboard");
  };

  return (
    <Flex
      align="center"
      gap="2"
      pb="4"
      w="full"
      display={{ base: "flex", md: "none" }}
    >
      <IconButton
        aria-label="Go back"
        icon={<Icon as={HiOutlineArrowLeft} boxSize={5} />}
        variant="ghost"
        borderRadius="full"
        ml="-2"
        onClick={goBack}
      />
      {pageName && (
        <Heading as="h1" fontSize="lg">
          {pageName}
        </Heading>
      )}
    </Flex>
  );
};

export default Header;
