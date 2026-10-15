/**
 * Set walk batch 79, part c (2026-10-15): Avatar: The Last Airbender (TLA), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

/** A real token (`spawn` of a token's card isn't one). */
function makeToken(game: Game, name: string, player = A): ObjectId {
  const before = new Set(game.battlefield);
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 });
  settle(game);
  const id = game.battlefield.find((each) => !before.has(each))!;
  game.state.objects[id].summoningSick = false;
  return id;
}

/** `player` draws `n` cards, settled. */
function draw(game: Game, n: number, player = A): void {
  game.debugApplyEffect(player, { kind: "draw", amount: n });
  settle(game);
}

/** `id` is dealt `n` damage by one of bob's creatures, settled. */
function damage(game: Game, id: ObjectId, n: number): void {
  const source = spawn(game, "Grizzly Bears", B);
  game.debugApplyEffect(B, { kind: "damage", amount: n, target: 0 }, [ref(id)], { source });
  settle(game);
}

/** Alice cracks a Clue — a real sacrifice, as a cost — with two Wastes,
 * from whenever she next holds priority. */
function crackClue(game: Game): void {
  const clue = game.battlefield.find((id) => game.state.objects[id].cardName === "Clue Token" && game.state.objects[id].controller === A)!;
  lands(game, "Wastes", 2);
  game.advanceUntil((s) => s.priority.holder === A);
  activate(game, clue);
}

describe("Dragonfly Swarm", () => {
  it("has power equal to the noncreature, nonland cards in your graveyard", () => {
    const { game } = table();
    const swarm = spawn(game, "Dragonfly Swarm");
    expect(pt(game, swarm)).toEqual({ power: 0, toughness: 3 });
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Firebending Lesson");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Forest");
    toGraveyard(game, "Lightning Bolt", B);
    expect(pt(game, swarm)).toEqual({ power: 2, toughness: 3 });
    expect(keywords(game, swarm).has("flying")).toBe(true);
  });

  it("draws a card as it dies only with a Lesson card in your graveyard", () => {
    const { game } = table();
    const swarm = spawn(game, "Dragonfly Swarm");
    const before = hand(game).length;
    destroy(game, swarm);
    expect(hand(game)).toHaveLength(before);

    const again = spawn(game, "Dragonfly Swarm");
    toGraveyard(game, "Firebending Lesson");
    destroy(game, again);
    expect(hand(game)).toHaveLength(before + 1);
  });
});

describe("Rowdy Snowballers", () => {
  it("taps an opponent's creature and stuns it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Rowdy Snowballers");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(1);
  });
});

describe("Gather the White Lotus", () => {
  it("makes an Ally for each Plains you control, then scries 2", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    lands(game, "Wastes", 2);
    spawn(game, "Plains", B);
    const spell = toHand(game, "Gather the White Lotus");
    cast(game, spell);
    expect(tokensNamed(game, "Ally Token", A)).toBe(3);
    expect(zone(game, spell)).toBe("graveyard");
  });
});

describe("Long Feng, Grand Secretariat", () => {
  it("puts a counter on a creature you control when another creature or a land of yours dies", () => {
    const { game, a } = table();
    const feng = spawn(game, "Long Feng, Grand Secretariat");
    const bears = spawn(game, "Grizzly Bears");
    const forest = spawn(game, "Forest");
    pickTargets(a, feng);
    destroy(game, bears);
    expect(counters(game, feng)).toBe(1);
    destroy(game, forest);
    expect(counters(game, feng)).toBe(2);
  });

  it("ignores an opponent's creature, and its own death while it isn't a land", () => {
    const { game } = table();
    const feng = spawn(game, "Long Feng, Grand Secretariat");
    const ally = spawn(game, "Grizzly Bears");
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(counters(game, feng)).toBe(0);
    destroy(game, feng);
    expect(counters(game, ally)).toBe(0);
  });

  it("counts itself once it's a land, and a land creature only once", () => {
    const { game, a } = table();
    const ashaya = spawn(game, "Ashaya, Soul of the Wild");
    const feng = spawn(game, "Long Feng, Grand Secretariat");
    const bears = spawn(game, "Grizzly Bears");
    expect(types(game, feng)).toContain("land");
    pickTargets(a, ashaya);
    destroy(game, bears);
    expect(counters(game, ashaya)).toBe(1);
    destroy(game, feng);
    expect(counters(game, ashaya)).toBe(2);
  });
});

describe("Dai Li Agents", () => {
  it("can earthbend the same land twice", () => {
    const { game, a } = table();
    const [forest] = lands(game, "Forest", 1);
    pickTargets(a, forest, forest);
    enter(game, "Dai Li Agents");
    expect(counters(game, forest)).toBe(2);
    expect(pt(game, forest)).toEqual({ power: 2, toughness: 2 });
  });

  it("drains each opponent for each creature you control with a +1/+1 counter as it attacks", () => {
    const { game, a } = table({ players: 3 });
    const agents = spawn(game, "Dai Li Agents");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(bears)]);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(agents)]);
    attack(game, a, [agents]);
    expect(life(game, A)).toBe(22);
    expect(life(game, B)).toBe(20 - 2 - 4);
    expect(life(game, C)).toBe(18);
  });
});

describe("Rebellious Captives", () => {
  it("puts two counters on itself, earthbends 2, and only once", () => {
    const { game, a } = table();
    lands(game, "Wastes", 12);
    const [forest] = lands(game, "Forest", 1);
    const captives = spawn(game, "Rebellious Captives");
    pickTargets(a, forest);
    activate(game, captives, 0, { targets: [ref(forest)] });
    expect(counters(game, captives)).toBe(2);
    expect(counters(game, forest)).toBe(2);
    expect(types(game, forest)).toContain("creature");
    expect(() => activate(game, captives, 0, { targets: [ref(forest)] })).toThrow();
  });
});

describe("Rough Rhino Cavalry", () => {
  it("adds {R}{R} as it attacks", () => {
    const { game, a } = table();
    const rhino = spawn(game, "Rough Rhino Cavalry");
    a.declareAttackersFn = () => [{ attacker: rhino, defender: B }];
    game.advanceUntil(
      (s) =>
        s.turn.step === "declare-attackers" &&
        s.awaiting === null &&
        s.zones.shared.stack.length === 0 &&
        s.pendingTriggers.length === 0 &&
        game.eventsOfType("ability-resolved").length > 0,
    );
    const pool = game.state.players[A].manaPool;
    expect(pool.filter((unit) => unit.type === "R")).toHaveLength(2);
  });

  it("exhausts for two counters and trample, once", () => {
    const { game } = table();
    lands(game, "Wastes", 16);
    const rhino = spawn(game, "Rough Rhino Cavalry");
    activate(game, rhino, 0);
    expect(counters(game, rhino)).toBe(2);
    expect(keywords(game, rhino).has("trample")).toBe(true);
    expect(() => activate(game, rhino, 0)).toThrow();
  });
});

describe("June, Bounty Hunter", () => {
  it("can't be blocked once you've drawn two cards this turn", () => {
    const { game } = table();
    const june = spawn(game, "June, Bounty Hunter");
    nextTurn(game);
    expect(keywords(game, june).has("unblockable")).toBe(false);
    draw(game, 1);
    draw(game, 1, B);
    expect(keywords(game, june).has("unblockable")).toBe(false);
    draw(game, 1);
    expect(keywords(game, june).has("unblockable")).toBe(true);
  });

  it("sacrifices another creature for a Clue, only during your turn", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const june = spawn(game, "June, Bounty Hunter");
    const bears = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: june, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: june, abilityIndex: 0, targets: [], sacrifice: june }),
    ).not.toBeNull();
  });

  it("can't be activated on an opponent's turn", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const june = spawn(game, "June, Bounty Hunter");
    const bears = spawn(game, "Grizzly Bears");
    nextTurn(game);
    game.advanceUntil((s) => s.priority.holder === A && s.turn.number === 2);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: june, abilityIndex: 0, targets: [], sacrifice: bears }),
    ).not.toBeNull();
  });
});

describe("Zhao, Ruthless Admiral", () => {
  it("gives your creatures +1/+0 whenever you sacrifice another permanent", () => {
    const { game } = table();
    const zhao = spawn(game, "Zhao, Ruthless Admiral");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    makeToken(game, "Clue Token");
    crackClue(game);
    expect(pt(game, zhao)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    destroy(game, bears);
    expect(pt(game, zhao)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Buzzard-Wasp Colony", () => {
  it("may sacrifice an artifact or creature as it enters to draw", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [bears];
    const before = hand(game).length;
    enter(game, "Buzzard-Wasp Colony");
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before + 1);
  });

  it("draws nothing when you decline", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    const before = hand(game).length;
    enter(game, "Buzzard-Wasp Colony");
    expect(zone(game, bears)).toBe("battlefield");
    expect(hand(game)).toHaveLength(before);
  });

  it("puts each kind of counter another creature of yours died with on itself", () => {
    const { game } = table();
    const colony = spawn(game, "Buzzard-Wasp Colony");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(bears)]);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "stun", amount: 1 }, [ref(bears)]);
    destroy(game, bears);
    expect(counters(game, colony)).toBe(2);
    expect(counters(game, colony, "stun")).toBe(1);
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(counters(game, colony)).toBe(2);
  });
});

describe("Lo and Li, Twin Tutors", () => {
  it("tutors a Lesson or Noble card to hand", () => {
    const { game, a } = table();
    const lesson = toLibrary(game, "Firebending Lesson");
    const seen = pickFromZone(a, lesson);
    enter(game, "Lo and Li, Twin Tutors");
    expect(seen.offered).toContain(lesson);
    expect(zone(game, lesson)).toBe("hand");
  });

  it("gives Noble creatures and Lesson spells you control lifelink", () => {
    const { game } = table();
    spawn(game, "Lo and Li, Twin Tutors");
    const noble = spawn(game, "Fire Lord Azula");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, noble).has("lifelink")).toBe(true);
    expect(keywords(game, bears).has("lifelink")).toBe(false);
    lands(game, "Mountain", 1);
    const target = spawn(game, "Grizzly Bears", B);
    const lesson = toHand(game, "Firebending Lesson");
    cast(game, lesson, { targets: [ref(target)] });
    expect(zone(game, target)).toBe("graveyard");
    expect(life(game)).toBe(22);
  });
});

describe("Tolls of War", () => {
  it("makes a Clue, then one Ally for the first sacrifice on your turn", () => {
    const { game } = table();
    enter(game, "Tolls of War");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    makeToken(game, "Clue Token");
    crackClue(game);
    expect(tokensNamed(game, "Ally Token", A)).toBe(1);
    crackClue(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
    expect(tokensNamed(game, "Ally Token", A)).toBe(1);
  });

  it("does nothing for a sacrifice on another player's turn, which doesn't use up the once", () => {
    const { game } = table();
    spawn(game, "Tolls of War");
    makeToken(game, "Clue Token");
    makeToken(game, "Clue Token");
    nextTurn(game);
    crackClue(game);
    expect(game.state.turn.number).toBe(2);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    expect(tokensNamed(game, "Ally Token", A)).toBe(0);
    nextTurn(game);
    crackClue(game);
    expect(tokensNamed(game, "Ally Token", A)).toBe(1);
  });
});

describe("Knowledge Seeker", () => {
  it("grows on the second card drawn each turn, and leaves a Clue as it dies", () => {
    const { game } = table();
    const seeker = spawn(game, "Knowledge Seeker");
    draw(game, 3);
    expect(counters(game, seeker)).toBe(1);
    draw(game, 1);
    expect(counters(game, seeker)).toBe(1);
    destroy(game, seeker);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });
});

describe("Fancy Footwork", () => {
  it("untaps one or two creatures and gives each +2/+2", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const one = spawn(game, "Grizzly Bears", A, { tapped: true });
    const two = spawn(game, "Grizzly Bears", B, { tapped: true });
    const spell = toHand(game, "Fancy Footwork");
    cast(game, spell, { targets: [ref(one), ref(two)] });
    for (const id of [one, two]) {
      expect(game.state.objects[id].tapped).toBe(false);
      expect(pt(game, id)).toEqual({ power: 4, toughness: 4 });
    }
  });

  it("works on just one", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const one = spawn(game, "Grizzly Bears", A, { tapped: true });
    cast(game, toHand(game, "Fancy Footwork"), { targets: [ref(one), null] });
    expect(pt(game, one)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Sold Out", () => {
  it("exiles the creature, with a Clue only if it was dealt damage this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 8);
    const hurt = spawn(game, "Hill Giant", B);
    damage(game, hurt, 1);
    cast(game, toHand(game, "Sold Out"), { targets: [ref(hurt)] });
    expect(zone(game, hurt)).toBe("exile");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);

    const fresh = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Sold Out"), { targets: [ref(fresh)] });
    expect(zone(game, fresh)).toBe("exile");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });

  it("doesn't count damage from an earlier turn", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const hurt = spawn(game, "Hill Giant", B);
    damage(game, hurt, 1);
    nextTurn(game);
    nextTurn(game);
    cast(game, toHand(game, "Sold Out"), { targets: [ref(hurt)] });
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
  });
});

describe("Callous Inspector", () => {
  it("deals 1 damage to you and makes a Clue as it dies", () => {
    const { game } = table();
    const inspector = spawn(game, "Callous Inspector");
    expect(keywords(game, inspector).has("menace")).toBe(true);
    destroy(game, inspector);
    expect(life(game)).toBe(19);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });
});

describe("Hei Bai, Spirit of Balance", () => {
  it("may sacrifice another creature or artifact for two counters as it enters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    a.chooseSacrificesFn = (_view, eligible) => {
      expect(eligible).toContain(bears);
      return [bears];
    };
    const heiBai = enter(game, "Hei Bai, Spirit of Balance");
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, heiBai)).toBe(2);
  });

  it("does it again as it attacks, and passes its counters on as it leaves", () => {
    const { game, a } = table();
    const heiBai = spawn(game, "Hei Bai, Spirit of Balance");
    const clue = makeToken(game, "Clue Token");
    const keeper = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [clue];
    attack(game, a, [heiBai]);
    expect(game.state.objects[clue]?.zone).not.toBe("battlefield");
    expect(counters(game, heiBai)).toBe(2);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "stun", amount: 1 }, [ref(heiBai)]);
    pickTargets(a, keeper);
    destroy(game, heiBai);
    expect(counters(game, keeper)).toBe(2);
    expect(counters(game, keeper, "stun")).toBe(1);
  });
});

describe("Earthen Ally", () => {
  it("gets +1/+0 for each colour among your Allies, itself included", () => {
    const { game } = table();
    const ally = spawn(game, "Earthen Ally");
    expect(pt(game, ally)).toEqual({ power: 1, toughness: 2 });
    makeToken(game, "Ally Token");
    expect(pt(game, ally)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Rowdy Snowballers");
    spawn(game, "Grizzly Bears");
    spawn(game, "Rowdy Snowballers", B);
    expect(pt(game, ally)).toEqual({ power: 3, toughness: 2 });
  });

  it("earthbends 5", () => {
    const { game, a } = table();
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest", "Wastes", "Wastes"]) spawn(game, land);
    const [target] = lands(game, "Wastes", 1);
    const ally = spawn(game, "Earthen Ally");
    pickTargets(a, target);
    activate(game, ally, 0, { targets: [ref(target)] });
    expect(counters(game, target)).toBe(5);
    expect(pt(game, target)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Rabaroo Troop", () => {
  it("gains flying and 1 life whenever a land you control enters", () => {
    const { game } = table();
    const troop = spawn(game, "Rabaroo Troop");
    expect(keywords(game, troop).has("flying")).toBe(false);
    enter(game, "Plains");
    expect(keywords(game, troop).has("flying")).toBe(true);
    expect(life(game)).toBe(21);
    enter(game, "Plains", B);
    expect(life(game)).toBe(21);
  });

  it("plainscycles for {2}", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const plains = toLibrary(game, "Plains");
    const troop = toHand(game, "Rabaroo Troop");
    pickFromZone(a, plains);
    const cycle = game.legalActions(A).find((o) => o.kind === "cycle" && o.card === troop);
    expect(cycle).toBeDefined();
    game.dispatch({ type: "cycle", player: A, card: troop });
    settle(game);
    expect(zone(game, troop)).toBe("graveyard");
    expect(zone(game, plains)).toBe("hand");
  });
});

describe("Deserter's Disciple", () => {
  it("makes another creature you control with power 2 or less unblockable this turn", () => {
    const { game, a, b } = table();
    const disciple = spawn(game, "Deserter's Disciple");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const activation = game.legalActions(A).find((o) => o.kind === "activate-ability" && o.source === disciple);
    const options = activation?.kind === "activate-ability" ? activation.targetOptions[0] : [];
    const offered = options.map((t) => (t.kind === "object" ? t.object : t.player));
    expect(offered).toContain(bears);
    expect(offered).not.toContain(giant);
    expect(offered).not.toContain(disciple);
    activate(game, disciple, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("unblockable")).toBe(true);
    // Bob would block it with his Bears, and isn't even asked.
    const blocker = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker, attacker: bears }];
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
  });
});

describe("Jet, Freedom Fighter", () => {
  it("deals damage equal to the number of creatures you control as he enters", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const ogre = spawn(game, "Grizzly Bears", B);
    pickTargets(a, giant);
    enter(game, "Jet, Freedom Fighter");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, ogre)).toBe("battlefield");
  });

  it("puts a +1/+1 counter on each of up to two creatures as he dies", () => {
    const { game, a } = table();
    const jet = spawn(game, "Jet, Freedom Fighter");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears", B);
    pickTargets(a, one, two);
    destroy(game, jet);
    expect(counters(game, one)).toBe(1);
    expect(counters(game, two)).toBe(1);
  });
});

