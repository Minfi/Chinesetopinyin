好的，我帮你整理一个 Kafka 命令行验证 Kerberos 认证的完整操作脚本，你只需要把里面的路径和信息替换成你自己的，就可以直接运行测试。

1. 准备工作
你需要有：

Kafka 安装目录（例如 /opt/kafka）
Kerberos Keytab 文件（例如 /etc/security/keytabs/appuser.keytab）
Kerberos 主体（例如 appuser@EXAMPLE.COM）
Kafka Broker 地址（例如 broker1.example.com:9092）
测试 Topic 名称（例如 test_topic）
2. 创建客户端配置文件
在 Kafka 的 config 目录创建 client.properties：

cat > /opt/kafka/config/client.properties << EOF
bootstrap.servers=broker1.example.com:9092
security.protocol=SASL_PLAINTEXT
sasl.mechanism=GSSAPI
sasl.kerberos.service.name=kafka
EOF
3. 创建 JAAS 配置文件
在 Kafka 的 config 目录创建 kafka_client_jaas.conf：

cat > /opt/kafka/config/kafka_client_jaas.conf << EOF
KafkaClient {
    com.sun.security.auth.module.Krb5LoginModule required
    useKeyTab=true
    storeKey=true
    keyTab="/etc/security/keytabs/appuser.keytab"
    principal="appuser@EXAMPLE.COM";
};
EOF
4. 启动生产者
export KAFKA_OPTS="-Djava.security.auth.login.config=/opt/kafka/config/kafka_client_jaas.conf"
/opt/kafka/bin/kafka-console-producer.sh \
    --broker-list broker1.example.com:9092 \
    --topic test_topic \
    --producer.config /opt/kafka/config/client.properties
输入消息，例如：

Hello Kafka with Kerberos!
输入完成后按 Ctrl+D 退出。

5. 启动消费者
export KAFKA_OPTS="-Djava.security.auth.login.config=/opt/kafka/config/kafka_client_jaas.conf"
/opt/kafka/bin/kafka-console-consumer.sh \
    --bootstrap-server broker1.example.com:9092 \
    --topic test_topic \
    --from-beginning \
    --consumer.config /opt/kafka/config/client.properties
如果配置正确，会看到刚才生产者发送的消息。

6. 注意事项
路径替换：将 /opt/kafka、Keytab 路径、Broker 地址等替换成你的实际信息。
权限：确保 Keytab 文件对运行 Kafka 命令的用户有读取权限。
KDC 连通性：客户端必须能访问 KDC（默认 UDP 88 端口）。
时间同步：Kerberos 对时间敏感，客户端与 KDC 时间差不能超过 5 分钟。
✅ 如果你需要的话，我可以帮你写一个 一键测试脚本，直接执行一次就能完成生产者和消费者的验证，省去手动敲命令的步骤。

你要我帮你写这个一键脚本吗？这样你直接运行就能验证 Kafka Kerberos 连接是否正常。·ca
