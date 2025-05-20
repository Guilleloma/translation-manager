'use client';

import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  Container,
  Avatar,
  Badge,
  HStack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useUser } from '../../context/UserContext';
import { UserRole } from '../../types/user';
import { useRouter } from 'next/navigation';
import TaskNotification from '../notifications/TaskNotification';

/**
 * Header Component
 * Provides navigation and user profile information
 */
export default function Header() {
  const { currentUser, isAuthenticated, logout } = useUser();
  const router = useRouter();
  
  // Handle logout
  const handleLogout = () => {
    console.log('Logging out user');
    // Pass router navigation as callback to prevent hooks error
    logout(() => router.push('/'));
  };

  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      borderBottom={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Container maxW={'container.xl'}>
        <Flex
          h={16}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <Link as={NextLink} href="/">
            <Text fontSize="xl" fontWeight="bold">
              Translation Manager
            </Text>
          </Link>

          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={4}>
              {isAuthenticated ? (
                <>
                  <Link as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
                    <Button variant="ghost">Inicio</Button>
                  </Link>
                  
                  {/* Only show admin link for admin users */}
                  {currentUser?.role === UserRole.ADMIN && (
                    <Link as={NextLink} href="/admin" _hover={{ textDecoration: 'none' }}>
                      <Button variant="ghost">Admin</Button>
                    </Link>
                  )}
                  
                  {/* Show translator tasks link for translators */}
                  {currentUser?.role === UserRole.TRANSLATOR && (
                    <Link as={NextLink} href="/translator-tasks" _hover={{ textDecoration: 'none' }}>
                      <Button variant="ghost">Mis Tareas</Button>
                    </Link>
                  )}
                  
                  {/* Notification component - only for translators */}
                  {currentUser?.role === UserRole.TRANSLATOR && (
                    <TaskNotification 
                      copys={[]}
                      onViewAssignedTasks={() => router.push('/translator-tasks')}
                    />
                  )}
                  
                  <Menu>
                    <MenuButton
                      as={Button}
                      rounded={'full'}
                      variant={'link'}
                      cursor={'pointer'}
                      minW={0}
                    >
                      <Avatar
                        size={'sm'}
                        name={currentUser?.username}
                      />
                    </MenuButton>
                    <MenuList>
                      <MenuItem fontWeight="bold">{currentUser?.username}</MenuItem>
                      <MenuItem>
                        <Badge colorScheme={currentUser?.role === UserRole.ADMIN ? 'purple' : 'green'}>
                          {currentUser?.role}
                        </Badge>
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
                    </MenuList>
                  </Menu>
                </>
              ) : (
                <Button
                  display={{ base: 'none', md: 'inline-flex' }}
                  fontSize={'sm'}
                  fontWeight={600}
                  color={'white'}
                  bg={'blue.400'}
                  onClick={() => router.push('/auth')}
                  _hover={{
                    bg: 'blue.300',
                  }}
                >
                  Iniciar sesión
                </Button>
              )}
            </Stack>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}
