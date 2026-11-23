import React from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Icon,
  SimpleGrid,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import {
  HiArrowRight,
  HiOutlineBookmark,
  HiOutlineBookOpen,
  HiOutlineChatBubbleLeftRight,
  HiOutlinePlus,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { useQuery } from "@tanstack/react-query";
import { Search } from "../../components/Search/Search";
import { EmptyState, LessonCard } from "../../components";
import LessonTabHeader from "./components/LessonTabHeader";
import {
  fetchLessons,
  fetchSavedLessons,
} from "../../api-endpoints/lessons/actions";
import { useStoreDispatch, useStoreSelector } from "../../redux/hooks";
import { Lesson, LessonType } from "src/types";
import {
  allLessonsPagePath,
  createLessonPagePath,
  studyChatPagePath,
} from "src/data/pageUrl";
import { WatchLessonModal } from "../CreateLesson";

export interface DashboardState {
  lessonType: LessonType;
  showVideo: boolean;
  activeLesson: Lesson | null;
}

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const StatCard = ({
  icon,
  label,
  value,
  to,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  to: string;
}) => (
  <Flex
    as={Link}
    to={to}
    align="center"
    gap="4"
    p="4"
    bg="white"
    border="1px solid"
    borderColor="ink.100"
    borderRadius="2xl"
    boxShadow="card"
    transition="box-shadow 0.2s ease"
    _hover={{ boxShadow: "cardHover" }}
  >
    <Flex
      boxSize="44px"
      borderRadius="xl"
      bg="brand.50"
      color="brand.600"
      align="center"
      justify="center"
      flexShrink={0}
    >
      <Icon as={icon} boxSize={5} />
    </Flex>
    <Box minW="0">
      <Text fontSize="xs" fontWeight={600} color="ink.500">
        {label}
      </Text>
      <Text fontSize="xl" fontWeight={800} color="ink.900" lineHeight="1.2">
        {value}
      </Text>
    </Box>
  </Flex>
);

const CardGridSkeleton = () => (
  <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} spacing="5">
    {[0, 1, 2].map((i) => (
      <Box
        key={i}
        bg="white"
        borderRadius="2xl"
        overflow="hidden"
        border="1px solid"
        borderColor="ink.100"
      >
        <Skeleton sx={{ aspectRatio: "16 / 9" }} />
        <Box p="4">
          <Skeleton h="4" w="70%" mb="3" borderRadius="md" />
          <Skeleton h="3" w="40%" borderRadius="md" />
        </Box>
      </Box>
    ))}
  </SimpleGrid>
);

const Dashboard: React.FC = () => {
  const dispatch = useStoreDispatch();
  const user = useStoreSelector((state) => state.user);
  const lessons = useStoreSelector((state) => state.lessons.lessons);
  const savedLessons = useStoreSelector((state) => state.lessons.savedLessons);

  const [state, setState] = React.useState<DashboardState>({
    lessonType: LessonType.Created,
    showVideo: false,
    activeLesson: null,
  });

  const handleStateUpdate = (newState: Partial<DashboardState>) =>
    setState((prev) => ({ ...prev, ...newState }));

  const createdLessons = React.useMemo(
    () => [...(lessons.data || [])].reverse(),
    [lessons.data]
  );
  const saved = React.useMemo(
    () => [...(savedLessons.data || [])].reverse(),
    [savedLessons.data]
  );

  const lessonData = (
    state.lessonType === LessonType.Saved ? saved : createdLessons
  ).slice(0, 6);

  const { isLoading: loadingCreated } = useQuery({
    queryKey: ["lessons"],
    queryFn: () => dispatch(fetchLessons()),
  });

  const { isLoading: loadingSaved } = useQuery({
    queryKey: ["savedLessons"],
    queryFn: () => dispatch(fetchSavedLessons()),
  });

  const isLoading =
    state.lessonType === LessonType.Saved ? loadingSaved : loadingCreated;
  const firstName = user.data?.firstName || user.data?.username || "there";
  const watch = (activeLesson: Lesson) =>
    handleStateUpdate({ showVideo: true, activeLesson });

  return (
    <Box
      w="full"
      maxW="1280px"
      mx="auto"
      px={{ base: "4", md: "6", xl: "8" }}
      py={{ base: "5", md: "8" }}
    >
      {/* Hero */}
      <Grid
        templateColumns={{ base: "1fr", lg: "1.6fr 1fr" }}
        gap="5"
        mb={{ base: "6", md: "8" }}
      >
        <Box
          position="relative"
          overflow="hidden"
          borderRadius="3xl"
          p={{ base: "6", md: "8" }}
          color="white"
          bgGradient="linear(135deg, brand.600 0%, brand.500 55%, #9E7BFF 100%)"
          boxShadow="cardHover"
        >
          <Box
            position="absolute"
            right="-60px"
            top="-60px"
            boxSize="220px"
            borderRadius="full"
            bg="whiteAlpha.200"
          />
          <Box
            position="absolute"
            right="80px"
            bottom="-90px"
            boxSize="180px"
            borderRadius="full"
            bg="whiteAlpha.100"
          />
          <Flex
            align="center"
            gap="2"
            fontSize="sm"
            fontWeight={600}
            color="whiteAlpha.900"
            mb="2"
            position="relative"
          >
            <Icon as={HiOutlineSparkles} />
            {greeting()}
          </Flex>
          <Heading
            as="h1"
            fontSize={{ base: "2xl", md: "3xl" }}
            color="white"
            mb="2"
            position="relative"
          >
            Welcome back, {firstName}
          </Heading>
          <Text
            color="whiteAlpha.900"
            maxW="440px"
            mb="6"
            position="relative"
            fontSize={{ base: "sm", md: "md" }}
          >
            Pick up where you left off, share a lesson with your study group,
            or record something new.
          </Text>
          <Flex gap="3" wrap="wrap" position="relative">
            <Button
              as={Link}
              to={createLessonPagePath}
              bg="white"
              color="brand.700"
              _hover={{ bg: "whiteAlpha.900" }}
              leftIcon={<Icon as={HiOutlinePlus} boxSize={5} />}
            >
              Create lesson
            </Button>
            <Button
              as={Link}
              to={studyChatPagePath}
              variant="outline"
              color="white"
              borderColor="whiteAlpha.600"
              _hover={{ bg: "whiteAlpha.200" }}
              leftIcon={<Icon as={HiOutlineChatBubbleLeftRight} boxSize={5} />}
            >
              Study Chat
            </Button>
          </Flex>
        </Box>

        <SimpleGrid columns={{ base: 2, lg: 1 }} spacing="4">
          <StatCard
            icon={HiOutlineBookOpen}
            label="Lessons created"
            value={loadingCreated ? "–" : createdLessons.length}
            to={allLessonsPagePath}
          />
          <StatCard
            icon={HiOutlineBookmark}
            label="Saved lessons"
            value={loadingSaved ? "–" : saved.length}
            to={`${allLessonsPagePath}?type=saved`}
          />
        </SimpleGrid>
      </Grid>

      <Box display={{ base: "block", md: "none" }}>
        <Search mb={6} onPage />
      </Box>

      {/* Lessons */}
      <Flex align="center" justify="space-between" gap="3" mb="5">
        <LessonTabHeader
          lessonType={state.lessonType}
          handleStateUpdate={handleStateUpdate}
        />
        <Button
          as={Link}
          to={allLessonsPagePath}
          variant="ghost"
          size="sm"
          color="brand.600"
          rightIcon={<Icon as={HiArrowRight} />}
        >
          View all
        </Button>
      </Flex>

      {isLoading && lessonData.length === 0 ? (
        <CardGridSkeleton />
      ) : lessonData.length === 0 ? (
        state.lessonType === LessonType.Saved ? (
          <EmptyState
            title="saved lesson"
            link={studyChatPagePath}
            height="sm"
            description="Lessons shared with you in Study Chat will show up here once you save them."
          />
        ) : (
          <EmptyState title="lesson" link={createLessonPagePath} height="sm" />
        )
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} spacing="5">
          {lessonData.map((lesson) => (
            <LessonCard
              lesson={lesson}
              key={lesson._id}
              hasWatch={false}
              descriptionLength={90}
              handleWatch={watch}
            />
          ))}
        </SimpleGrid>
      )}

      <WatchLessonModal
        show={state.showVideo}
        lesson={state.activeLesson}
        handleClose={() =>
          handleStateUpdate({ showVideo: false, activeLesson: null })
        }
      />
    </Box>
  );
};

export default Dashboard;
