import { ChangeEvent, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Stack,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import {
  FiBookOpen,
  FiBookmark,
  FiCalendar,
  FiLock,
  FiMail,
  FiRotateCcw,
} from "react-icons/fi";
import { IconType } from "react-icons";
import { format } from "date-fns";
import Header from "../../components/Header/Header";
import { getSingleUser, postUser } from "src/api-endpoints/user/user.api";
import { fetchLessons, fetchSavedLessons } from "src/api-endpoints/lessons";
import { useQuery } from "@tanstack/react-query";
import {
  SingleUserI,
  UpdateUserRequest,
} from "src/api-endpoints/user/user.interface";
import { useStoreDispatch, useStoreSelector } from "../../redux/hooks";
import { updateUserData } from "../../redux/reducers/userReducer";
import { getToken, USER } from "src/utils/constant";

interface AccountForm {
  name: string;
  email: string;
  phoneNumber: string;
  bio: string;
}

interface AccountDraft {
  form: AccountForm;
  saved: { name: string; bio: string };
}

interface StatItemProps {
  icon: IconType;
  value: number;
  label: string;
}

interface LockedFieldProps {
  id: string;
  label: string;
  value: string;
  icon: IconType;
}

const getStoredUserId = (): string | undefined => USER()?.data?.user?._id;

const CARD_STYLES = {
  bg: "white",
  border: "1px solid",
  borderColor: "blackAlpha.100",
  borderRadius: "2xl",
  boxShadow:
    "0 1px 2px rgba(16, 24, 40, 0.04), 0 20px 40px -32px rgba(25, 18, 49, 0.35)",
};

const FIELD_STYLES = {
  height: "48px",
  borderRadius: "lg",
  borderColor: "blackAlpha.200",
  fontSize: "sm",
  _placeholder: { color: "black.10" },
  _hover: { borderColor: "blackAlpha.300" },
  _focusVisible: {
    borderColor: "primary.50",
    boxShadow: "0 0 0 3px rgba(123, 88, 244, 0.18)",
  },
};

const READ_ONLY_FIELD = {
  bg: "blackAlpha.50",
  color: "black.30",
  cursor: "not-allowed",
  _hover: { borderColor: "blackAlpha.200" },
};

const resolveName = (
  source?: {
    name?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  } | null
): string =>
  source?.name ||
  source?.username ||
  [source?.firstName, source?.lastName].filter(Boolean).join(" ");

const formatJoined = (value?: string): string => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return format(date, "MMMM yyyy");
};

const StatItem = ({ icon, value, label }: StatItemProps) => (
  <HStack spacing="3" flex="1" minW="0">
    <Flex
      boxSize="42px"
      flexShrink="0"
      align="center"
      justify="center"
      borderRadius="xl"
      bg="primary.5"
      color="primary.60"
    >
      <Icon as={icon} boxSize="18px" />
    </Flex>
    <Box minW="0">
      <Text fontSize="lg" fontWeight="600" color="black.40" lineHeight="1.2">
        {value}
      </Text>
      <Text fontSize="xs" color="black.20" fontWeight="500" isTruncated>
        {label}
      </Text>
    </Box>
  </HStack>
);

const LockedField = ({ id, label, value, icon }: LockedFieldProps) => (
  <FormControl flex="1">
    <FormLabel
      htmlFor={id}
      mb="2"
      fontSize="sm"
      fontWeight="600"
      color="black.30"
    >
      {label}
    </FormLabel>
    <InputGroup>
      <Input
        id={id}
        value={value}
        isReadOnly
        placeholder="—"
        pr="10"
        {...FIELD_STYLES}
        {...READ_ONLY_FIELD}
      />
      <InputRightElement height="48px" color="black.10">
        <Icon as={icon} />
      </InputRightElement>
    </InputGroup>
  </FormControl>
);

export default function AccountInfo(): JSX.Element {
  const dispatch = useStoreDispatch();
  const toast = useToast();
  const user = useStoreSelector((state) => state.user.data);

  // The user record does not carry lesson counts, so both stats read the same
  // lessons endpoints (and react-query cache) as the All/Dashboard views.
  const lessons = useStoreSelector((state) => state.lessons["lessons"]);
  const savedLessons = useStoreSelector(
    (state) => state.lessons["savedLessons"]
  );

  useQuery({ queryKey: ["lessons"], queryFn: () => dispatch(fetchLessons()) });
  useQuery({
    queryKey: ["savedLessons"],
    queryFn: () => dispatch(fetchSavedLessons()),
  });

  const [details, setDetails] = useState<SingleUserI | null>(null);
  const [draft, setDraft] = useState<AccountDraft>(() => {
    const form: AccountForm = {
      name: resolveName(user),
      email: user?.email ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      bio: user?.bio ?? "",
    };

    return { form, saved: { name: form.name.trim(), bio: form.bio.trim() } };
  });
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isNameTouched, setIsNameTouched] = useState(false);

  const { form, saved } = draft;
  const userId = user?._id || getStoredUserId();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = getToken();
      if (!userId || !token) return;

      setIsFetching(true);
      try {
        const response = await getSingleUser(userId, token);
        const fresh = response?.data;
        if (!fresh) return;

        dispatch(updateUserData(response as any));
        setDetails(fresh);

        setDraft((prev) => {
          const merged: AccountForm = {
            name: resolveName(fresh) || prev.form.name,
            email: fresh.email ?? prev.form.email,
            phoneNumber: fresh.phoneNumber ?? prev.form.phoneNumber,
            bio: fresh.bio ?? prev.form.bio,
          };

          return {
            form: merged,
            saved: { name: merged.name.trim(), bio: merged.bio.trim() },
          };
        });
      } catch (error) {
        console.error("Error fetching account details:", error);
        toast({
          title: "Unable to load account details",
          description: "Try again later",
          status: "error",
          duration: 3000,
          position: "top-right",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserDetails();
  }, [userId, dispatch, toast]);

  const handleChange =
    (field: keyof AccountForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft((prev) => ({
        ...prev,
        form: { ...prev.form, [field]: event.target.value },
      }));

  const trimmedName = form.name.trim();
  const trimmedBio = form.bio.trim();
  const isDirty = trimmedName !== saved.name || trimmedBio !== saved.bio;
  const isNameInvalid = isNameTouched && !trimmedName;

  const handleReset = () => {
    setDraft((prev) => ({
      form: { ...prev.form, name: prev.saved.name, bio: prev.saved.bio },
      saved: prev.saved,
    }));
    setIsNameTouched(false);
  };

  const handleSubmit = async () => {
    const token = getToken();

    if (!userId) {
      toast({
        title: "You need to be signed in to update your account",
        status: "error",
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    if (!trimmedName) {
      setIsNameTouched(true);
      toast({
        title: "Name cannot be empty",
        status: "warning",
        duration: 2500,
        position: "top-right",
      });
      return;
    }

    const payload: UpdateUserRequest = { name: trimmedName, bio: trimmedBio };
    setIsSaving(true);

    try {
      const response = await postUser(payload, userId, token);
      let updated = response?.data;

      if (updated) {
        dispatch(updateUserData({ data: { ...user, ...updated } } as any));
      } else if (token) {
        const fresh = await getSingleUser(userId, token);
        updated = fresh?.data;
        if (fresh) dispatch(updateUserData(fresh as any));
      }

      const nextName = updated?.name || updated?.username || trimmedName;
      const nextBio = updated?.bio ?? trimmedBio;

      setDraft((prev) => ({
        form: { ...prev.form, name: nextName, bio: nextBio },
        saved: { name: nextName.trim(), bio: nextBio.trim() },
      }));
      setDetails((prev) => (prev ? { ...prev, ...updated } : prev));

      toast({
        title: response?.message || "Account updated successfully",
        status: "success",
        duration: 2500,
        position: "top-right",
      });
    } catch (error: any) {
      toast({
        title:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to update account",
        description: "Try again later",
        status: "error",
        duration: 3000,
        position: "top-right",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = resolveName(details) || resolveName(user) || "Your account";
  const displayEmail = details?.email || user?.email || "";
  const displayPhoto = details?.profilePhoto || user?.profilePhoto || "";
  const joined = formatJoined(details?.createdAt);
  const createdCount = (lessons.data || []).length;
  const savedCount = (savedLessons.data || []).length;
  const isBusy = isFetching || isSaving;

  return (
    <Box bg={{ base: "gray.50", md: "transparent" }} minH={{ base: "100vh", md: "auto" }}>
      <Box
        maxW="820px"
        mx="auto"
        px={{ base: "4", md: "0" }}
        pb={{ base: "28", md: "10" }}
      >
        <Header pageName="Info" />

        <Box {...CARD_STYLES} overflow="hidden">
          <Box
            position="relative"
            h={{ base: "110px", md: "140px" }}
            bgGradient="linear(120deg, primary.70 0%, primary.50 52%, primary.40 100%)"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="-70px"
              right="-40px"
              boxSize="200px"
              borderRadius="full"
              bg="whiteAlpha.200"
            />
            <Box
              position="absolute"
              bottom="-90px"
              left="-50px"
              boxSize="220px"
              borderRadius="full"
              bg="whiteAlpha.100"
            />
            <Box
              position="absolute"
              top="18px"
              right="120px"
              boxSize="10px"
              borderRadius="full"
              bg="whiteAlpha.300"
            />
            <Box
              position="absolute"
              top="58px"
              right="70px"
              boxSize="6px"
              borderRadius="full"
              bg="whiteAlpha.400"
            />
          </Box>

          <Box px={{ base: "5", md: "8" }} pb={{ base: "6", md: "7" }}>
            <Flex justify="space-between" align="flex-end" gap="4">
              <Avatar
                name={displayName}
                src={displayPhoto || undefined}
                boxSize={{ base: "88px", md: "108px" }}
                mt={{ base: "-44px", md: "-56px" }}
                border="4px solid"
                borderColor="white"
                bg="primary.5"
                color="primary.70"
                fontWeight="600"
                boxShadow="0 14px 28px -16px rgba(25, 18, 49, 0.55)"
              />
              {isFetching && (
                <HStack spacing="2" color="black.20" fontSize="xs" pb="1">
                  <Spinner size="xs" color="primary.50" />
                  <Text>Syncing</Text>
                </HStack>
              )}
            </Flex>

            <Flex mt="4" align="center" gap="2" wrap="wrap">
              <Text
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="600"
                color="black.40"
                noOfLines={1}
              >
                {displayName}
              </Text>
            </Flex>

            <Flex
              mt="2"
              gap={{ base: "2", md: "5" }}
              direction={{ base: "column", md: "row" }}
              color="black.20"
              fontSize="sm"
            >
              <HStack spacing="2" minW="0">
                <Icon as={FiMail} color="black.10" />
                <Text isTruncated>{displayEmail || "No email on file"}</Text>
              </HStack>
              {joined && (
                <HStack spacing="2">
                  <Icon as={FiCalendar} color="black.10" />
                  <Text>Joined {joined}</Text>
                </HStack>
              )}
            </Flex>

            <Flex
              mt={{ base: "6", md: "7" }}
              pt="5"
              borderTop="1px solid"
              borderColor="blackAlpha.100"
              gap={{ base: "4", md: "8" }}
            >
              <StatItem
                icon={FiBookOpen}
                value={createdCount}
                label="Lessons created"
              />
              <Box
                w="1px"
                bg="blackAlpha.100"
                alignSelf="stretch"
                display={{ base: "none", sm: "block" }}
              />
              <StatItem
                icon={FiBookmark}
                value={savedCount}
                label="Saved lessons"
              />
            </Flex>
          </Box>
        </Box>

        <Box mt="6" {...CARD_STYLES} p={{ base: "5", md: "8" }}>
          <Text fontSize="lg" fontWeight="600" color="black.40">
            Personal information
          </Text>
          <Text mt="1" fontSize="sm" color="black.20">
            This is how your name and bio appear to other people on KlosaNow.
          </Text>

          <Stack mt="7" spacing="5">
            <FormControl isInvalid={isNameInvalid} isDisabled={isBusy}>
              <FormLabel
                htmlFor="nameInput"
                mb="2"
                fontSize="sm"
                fontWeight="600"
                color="black.30"
              >
                Full name
              </FormLabel>
              <Input
                id="nameInput"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange("name")}
                onBlur={() => setIsNameTouched(true)}
                {...FIELD_STYLES}
              />
              <FormErrorMessage>
                Please enter your name before saving.
              </FormErrorMessage>
            </FormControl>

            <Flex direction={{ base: "column", md: "row" }} gap="5">
              <LockedField
                id="emailInput"
                label="Email address"
                value={form.email}
                icon={FiMail}
              />
              <LockedField
                id="phoneInput"
                label="Phone number"
                value={form.phoneNumber}
                icon={FiLock}
              />
            </Flex>

            <FormControl isDisabled={isBusy}>
              <Flex justify="space-between" align="center" mb="2">
                <FormLabel
                  htmlFor="bioInput"
                  mb="0"
                  fontSize="sm"
                  fontWeight="600"
                  color="black.30"
                >
                  Bio
                </FormLabel>
                <Text fontSize="xs" color="black.10">
                  {form.bio.length} characters
                </Text>
              </Flex>
              <Textarea
                id="bioInput"
                placeholder="Tell students a bit about yourself"
                value={form.bio}
                onChange={handleChange("bio")}
                minH="132px"
                resize="none"
                {...FIELD_STYLES}
                height="auto"
              />
            </FormControl>
          </Stack>

          <Flex
            mt="7"
            pt="6"
            borderTop="1px solid"
            borderColor="blackAlpha.100"
            direction={{ base: "column-reverse", md: "row" }}
            align={{ base: "stretch", md: "center" }}
            justify="space-between"
            gap="4"
          >
            <HStack
              spacing="2"
              color="black.20"
              fontSize="xs"
              align="flex-start"
            >
              <Icon as={FiLock} mt="0.5" flexShrink="0" />
              <Text>Email and phone number cannot be changed here.</Text>
            </HStack>

            <HStack
              spacing="3"
              justify="flex-end"
              width={{ base: "full", md: "auto" }}
            >
              {isDirty && !isSaving && (
                <Button
                  variant="ghost"
                  leftIcon={<Icon as={FiRotateCcw} />}
                  onClick={handleReset}
                  isDisabled={isFetching}
                  color="black.30"
                  _hover={{ bg: "blackAlpha.50" }}
                  borderRadius="xl"
                  height="48px"
                >
                  Reset
                </Button>
              )}
              <Button
                bg="primary.50"
                color="neutral.10"
                _hover={{ bg: "primary.60" }}
                _active={{ bg: "primary.70" }}
                isLoading={isSaving}
                loadingText="Saving"
                isDisabled={!isDirty || isNameInvalid || isFetching}
                onClick={handleSubmit}
                borderRadius="xl"
                height="48px"
                px="7"
                fontWeight="600"
                boxShadow="0 12px 24px -14px rgba(123, 88, 244, 0.9)"
                flex={{ base: "1", md: "none" }}
              >
                Save changes
              </Button>
            </HStack>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}
