import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Badge, Card } from '../common';

interface Auction {
  id: string;
  title: string;
  currentPrice: number;
  startPrice: number;
  imageUrl?: string;
  timeLeft: string;
  location: string;
  bidCount: number;
  category: string;
  status?: 'active' | 'ended';
}

interface AuctionCardProps {
  auction: Auction;
  onPress: (auctionId: string) => void;
  style?: ViewStyle;
  showStatus?: boolean;
}

export default function AuctionCard({
  auction,
  onPress,
  style,
  showStatus = false,
}: AuctionCardProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString() + '원';
  };

  const getStatusVariant = () => {
    if (!auction.status) return 'primary';
    return auction.status === 'active' ? 'success' : 'secondary';
  };

  const getStatusText = () => {
    if (!auction.status) return '';
    return auction.status === 'active' ? '진행중' : '종료';
  };

  return (
    <Card
      style={StyleSheet.flatten([styles.container, style])}
      onPress={() => onPress(auction.id)}
      padding={0}
    >
      <View style={styles.imageContainer}>
        {auction.imageUrl ? (
          <Image source={{ uri: auction.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="image" size={40} color="#CCCCCC" />
          </View>
        )}
        
        <View style={styles.timeLeftBadge}>
          <Text style={styles.timeLeftText}>{auction.timeLeft}</Text>
        </View>
        
        {showStatus && auction.status && (
          <View style={styles.statusBadge}>
            <Badge
              text={getStatusText()}
              variant={getStatusVariant()}
              size="small"
            />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {auction.title}
        </Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>{formatPrice(auction.currentPrice)}</Text>
          <Text style={styles.startPrice}>시작가: {formatPrice(auction.startPrice)}</Text>
        </View>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Icon name="location-on" size={16} color="#666666" />
            <Text style={styles.metaText}>{auction.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="gavel" size={16} color="#666666" />
            <Text style={styles.metaText}>{auction.bidCount}회 입찰</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  timeLeftBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeLeftText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    lineHeight: 22,
  },
  priceContainer: {
    marginBottom: 12,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  startPrice: {
    fontSize: 14,
    color: '#999999',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
});