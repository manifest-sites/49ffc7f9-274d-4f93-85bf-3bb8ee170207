import { useState, useEffect } from 'react'
import { Card, Button, Progress, Typography, Space, Row, Col, message } from 'antd'
import { Vote } from '../entities/Vote'

const { Title, Text } = Typography

const ColorVotingApp = () => {
  const [votes, setVotes] = useState([])
  const [voteCounts, setVoteCounts] = useState({})
  const [totalVotes, setTotalVotes] = useState(0)
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(false)

  const colors = [
    { name: 'Red', hex: '#ef4444', bgClass: 'bg-red-500' },
    { name: 'Blue', hex: '#3b82f6', bgClass: 'bg-blue-500' },
    { name: 'Green', hex: '#10b981', bgClass: 'bg-green-500' },
    { name: 'Purple', hex: '#8b5cf6', bgClass: 'bg-purple-500' },
    { name: 'Orange', hex: '#f97316', bgClass: 'bg-orange-500' },
    { name: 'Pink', hex: '#ec4899', bgClass: 'bg-pink-500' },
    { name: 'Yellow', hex: '#eab308', bgClass: 'bg-yellow-500' },
    { name: 'Teal', hex: '#14b8a6', bgClass: 'bg-teal-500' }
  ]

  const loadVotes = async () => {
    try {
      const response = await Vote.list()
      if (response.success) {
        setVotes(response.data)
        
        // Calculate vote counts
        const counts = {}
        colors.forEach(color => counts[color.name] = 0)
        
        response.data.forEach(vote => {
          if (counts.hasOwnProperty(vote.color)) {
            counts[vote.color]++
          }
        })
        
        setVoteCounts(counts)
        setTotalVotes(response.data.length)
      }
    } catch (error) {
      console.error('Error loading votes:', error)
    }
  }

  const handleVote = async (colorName) => {
    if (hasVoted) {
      message.warning('You have already voted!')
      return
    }

    setLoading(true)
    try {
      const response = await Vote.create({
        color: colorName,
        timestamp: new Date().toISOString()
      })
      
      if (response.success) {
        message.success(`You voted for ${colorName}!`)
        setHasVoted(true)
        await loadVotes()
      }
    } catch (error) {
      console.error('Error voting:', error)
      message.error('Failed to cast vote')
    } finally {
      setLoading(false)
    }
  }

  const getPercentage = (count) => {
    return totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
  }

  const getWinningColor = () => {
    if (totalVotes === 0) return null
    return Object.entries(voteCounts).reduce((a, b) => voteCounts[a[0]] > voteCounts[b[0]] ? a : b)
  }

  useEffect(() => {
    loadVotes()
  }, [])

  const winningColor = getWinningColor()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Title level={1} className="text-gray-800 mb-2">
            🎨 Vote for Your Favorite Color!
          </Title>
          <Text className="text-lg text-gray-600">
            Cast your vote and see what color is most popular
          </Text>
        </div>

        {/* Voting Section */}
        <Card className="mb-8 shadow-lg" title="Cast Your Vote">
          <Row gutter={[16, 16]}>
            {colors.map((color) => (
              <Col xs={12} sm={8} md={6} key={color.name}>
                <Button
                  type="primary"
                  size="large"
                  className="w-full h-20 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  style={{ 
                    backgroundColor: color.hex,
                    borderColor: color.hex,
                    opacity: hasVoted ? 0.6 : 1
                  }}
                  onClick={() => handleVote(color.name)}
                  disabled={hasVoted || loading}
                  loading={loading}
                >
                  {color.name}
                </Button>
              </Col>
            ))}
          </Row>
          {hasVoted && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Text className="text-green-700">
                ✅ Thanks for voting! You can see the results below.
              </Text>
            </div>
          )}
        </Card>

        {/* Results Section */}
        <Card className="shadow-lg" title={`Results (${totalVotes} total votes)`}>
          {totalVotes === 0 ? (
            <div className="text-center py-8">
              <Text className="text-gray-500 text-lg">
                No votes yet! Be the first to vote for your favorite color.
              </Text>
            </div>
          ) : (
            <Space direction="vertical" className="w-full" size="large">
              {winningColor && (
                <div className="text-center p-4 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg border border-yellow-300">
                  <Title level={3} className="text-yellow-800 mb-2">
                    🏆 Current Winner
                  </Title>
                  <div 
                    className="inline-block px-6 py-3 rounded-full text-white font-bold text-xl shadow-lg"
                    style={{ backgroundColor: colors.find(c => c.name === winningColor[0])?.hex }}
                  >
                    {winningColor[0]} ({winningColor[1]} votes)
                  </div>
                </div>
              )}

              {colors.map((color) => {
                const count = voteCounts[color.name] || 0
                const percentage = getPercentage(count)
                
                return (
                  <div key={color.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        <Text strong className="text-lg">{color.name}</Text>
                      </div>
                      <Text className="text-gray-600">
                        {count} votes ({percentage}%)
                      </Text>
                    </div>
                    <Progress 
                      percent={percentage} 
                      strokeColor={color.hex}
                      trailColor="#f3f4f6"
                      strokeWidth={8}
                      showInfo={false}
                    />
                  </div>
                )
              })}
            </Space>
          )}
        </Card>

        <div className="text-center mt-8">
          <Button 
            type="link" 
            onClick={() => window.location.reload()}
            className="text-gray-500"
          >
            Reset and vote again
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ColorVotingApp