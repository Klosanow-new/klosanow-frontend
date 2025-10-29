import React, { useEffect, useState } from "react";
import { Box, Text, Flex, Button } from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStoreSelector } from "src/redux/hooks";
import { StudyChatContext } from "../../context/StudyChat";
import { AxiosInstance as Axios } from "src/utils/axios";
import { getToken } from "src/utils/constant";
import { studyChatApiRoute } from "src/data/apiUrl";
const InviteLink: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const groupId = searchParams.get("group");
  const user = useStoreSelector((state) => state.user);
  const { updateStudyChatValues } = React.useContext(StudyChatContext);

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [groupData, setGroupData] = useState<any>(null);

  const getStudyGroupInternal = async () => {
    const token = getToken();

    const { data } = await Axios.get(`${studyChatApiRoute}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // console.log("data from backend", data);
    return data;
  };

  const updateStudyChat = async (id: string, body: any) => {
    const token = getToken();
    const { data } = await Axios.put(`${studyChatApiRoute}/${id}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  };

  useEffect(() => {
    if (!groupId) {
      navigate("/");
      return;
    }

    //if user not signed in
    if (!user?.data?._id) {
      console.warn("❌ No user found, redirecting to sign-up");
      navigate(`/sign-up?invite=${groupId}`);
      return;
    }

    const fetchGroup = async () => {
      try {
        setLoading(true);
        // console.log("🚀 Fetching group info for groupId:", groupId);

        //fetch group info
        const response = await getStudyGroupInternal();
        // console.log("the response is", response);

        const allGroups = response?.data;
        const targetGroup = allGroups.find((g: any) => g._id === groupId);
        // console.log("🎯 Extracted group object:", targetGroup);

        if (!targetGroup) {
          console.warn("❌ User not found in any group");

          try {
            const addResponse = await updateStudyChat(groupId, {
              members: {
                addMembers: [user?.data?._id],
                removeMembers: [],
              },
            });

            // console.log("Added new user to group", addResponse);
            setGroupData(addResponse?.data || {});
            updateStudyChatValues({ activeChat: addResponse?.data });
            navigate(`/study-chat?slug=${groupId}`);
            return;
          } catch (error) {
            console.error("failed to add user to group:", error);
            navigate("/");
            return;
          }
        }

        setGroupData(targetGroup);

        //check if the user already a member
        const memberIds = targetGroup?.members?.map((m: any) => m._id);
        // console.log("👥 Group members:", memberIds);

        const isMember = memberIds?.includes(user?.data?._id);
        // console.log("🧑‍💻 Is user a member?", isMember);

        setAlreadyMember(isMember);

        if (isMember) {
          // console.log("✅ User is already a member, navigating to chat");
          updateStudyChatValues({ activeChat: targetGroup });
          navigate(`/study-chat?slug=${targetGroup._id}`);
          return;
        }

        await updateStudyChat(groupId, {
          members: {
            addMembers: [user?.data?._id],
            removeMembers: [],
          },
        });
      } catch (error) {
        console.error("error fetching or updating group;", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId, user]);

  const handleJoinGroup = () => {
    setJoining(true);

    setTimeout(() => {
      // console.log("✅ Finalizing join, setting activeChat to:", groupData);
      setJoining(false);

      updateStudyChatValues({
        activeChat: groupData,
      });

      navigate(`/study-chat?slug=${groupData?._id}`);
    }, 1000);
  };

  if (loading)
    return (
      <Flex align="center" justify="center" h="100vh">
        <Text>Loading group...</Text>
      </Flex>
    );

  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      h="100vh"
      bg="gray.50"
      textAlign="center"
      px={4}
    >
      <Box bg="white" p={8} borderRadius="xl" boxShadow="md">
        <Text fontSize="2xl" fontWeight="bold" mb={4}>
          Join {groupData?.title || groupData?.name}
        </Text>
        <Text mb={6}>{groupData?.description}</Text>

        <Button
          colorScheme="blue"
          onClick={handleJoinGroup}
          isLoading={joining}
          loadingText="Joining..."
        >
          {alreadyMember ? "Go to Group" : "Join Group"}
        </Button>
      </Box>
    </Flex>
  );
};

export default InviteLink;
