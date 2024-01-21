import { _decorator, Component, Node, RigidBody2D, Vec2, input, Input, Vec3, Collider2D, Contact2DType, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
    @property({ type: Node })
    private moonNode: Node = null;

    @property({ type: Node })
    private mubanNodes = null;

    @property({ type: Prefab })
    private mubanPrefab = null;

    private vspeed = 0;
    private gameStates = 0;
    private mubanGap = 500;

    start() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.collisionHandler();
        this.initMubans();
    }

    update(deltaTime: number) {
        this.moveAllMuban(deltaTime);
    }

    moveAllMuban(deltaTime) {
        const speed = -300 * deltaTime;
        for (let itemNode of this.mubanNodes.children) {
            const pos = itemNode.position.clone();
            pos.x += speed;
            itemNode.position = pos;
            this.checkMubanOut(itemNode);
        }
    }

    checkMubanOut(node) {
        if (node.position.x < -400) {
            const nextPosX = this.getLastMubanPosX()+ this.mubanGap;
            node.position = new Vec3(nextPosX, node.position.y, 0);
        }
    }

    getLastMubanPosX() {
        let lastNodeX = 0;
        for (let node of this.mubanNodes.children) {
            if (node.position.x > lastNodeX) {
                lastNodeX = node.position.x;
            }
        }

        return lastNodeX;
    }

    initMubans() {
        let posX = null;
        for (let i = 0; i < 5; i++) {
            if (i === 0) {
                posX = this.moonNode.position.x;
            } else {
                posX = posX + this.mubanGap;
            }

            this.createNewBlock(new Vec3(posX, 0, 0));
        }
    }

    createNewBlock(pos) {
        const mubanNode = instantiate(this.mubanPrefab);
        mubanNode.position = pos;
        this.mubanNodes.addChild(mubanNode);
    }

    onTouchStart() {
        const rigidbody = this.moonNode.getComponent(RigidBody2D);

        if (this.vspeed === 0) {
            // moon还没有完成第一次下落.只有第一次接触后才可以加速下落
            return;
        }

        rigidbody.linearVelocity = new Vec2(0, -this.vspeed * 1.5);
        console.log(`触摸后速度垂直速度=${rigidbody.linearVelocity.y}`);
        this.gameStates = 1;
    }

    collisionHandler() {
        const collider = this.moonNode.getComponent(Collider2D);
        const rigidbody = this.moonNode.getComponent(RigidBody2D);
        collider.on(Contact2DType.BEGIN_CONTACT, ()=>{
            if (this.vspeed === 0) {
                this.vspeed = Math.abs(rigidbody.linearVelocity.y);
            } else {
                // 第一次接触之后，每一次接触反弹的初速度都等于vspeed.也就是说每次回弹的高度一样.
                rigidbody.linearVelocity = new Vec2(0, this.vspeed);
            }
            console.log(`速度vspeed=${this.vspeed}`);
        }, this);
    }
}