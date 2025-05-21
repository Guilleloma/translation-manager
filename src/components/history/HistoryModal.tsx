'use client';

import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Box,
  Divider
} from '@chakra-ui/react';
import { Copy } from '../../types/copy';
import ChangeHistory from './ChangeHistory';

interface HistoryModalProps {
  copy: Copy | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal para mostrar el historial de cambios de un copy
 * 
 * @param copy - El copy del que se mostrará el historial
 * @param isOpen - Indica si el modal está abierto
 * @param onClose - Función para cerrar el modal
 */
const HistoryModal: React.FC<HistoryModalProps> = ({ copy, isOpen, onClose }) => {
  // Log para debugging
  console.log('Rendering HistoryModal for copy:', copy?.slug);
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Historial de cambios
          {copy && (
            <Text fontSize="sm" fontWeight="normal" color="gray.500">
              {copy.slug}
            </Text>
          )}
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        
        <ModalBody py={4}>
          {copy ? (
            copy.history && copy.history.length > 0 ? (
              <ChangeHistory history={copy.history} />
            ) : (
              <Box p={4} textAlign="center">
                <Text color="gray.500">
                  No hay historial de cambios para este copy
                </Text>
              </Box>
            )
          ) : (
            <Box p={4} textAlign="center">
              <Text color="gray.500">
                Cargando historial...
              </Text>
            </Box>
          )}
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default HistoryModal;
