/**
 * Commander Legends (CMR), group c. No engine change: each test pins the
 * clause most likely to be wired wrong — creatures that entered this turn in a
 * mana ability (Alena), mana for the active player counted over Belbe's
 * controller's opponents (Belbe), cascade on commander spells only (Flamekin
 * Herald), a dies trigger that sees Slurrk itself (Slurrk), the entering
 * creature as the damage source of a paid reflexive trigger (Halana), "other"
 * creatures' greatest power (Tuya), any artifact going to a graveyard (Ich-
 * Tekik), a look filtered by the entering permanent's card types (Amareth),
 * three other artifacts and/or creatures as a cost (Keskit), and "nontoken
 * with a +1/+1 counter" (Alharu).
 */
import { describe, expect, it } from "vitest";

import type { PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";
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
  graveyard,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";

const manaOf = (game: Game, player: PlayerId, type: string): number =>
  game.state.players[player].manaPool.filter((u) => u.type === type).length;

describe("CMR group c — Alena, Kessig Trapper", () => {
  it("adds {R} equal to the greatest power among creatures that entered this turn", () => {
    const { game } = table();
    const alena = spawn(game, "Alena, Kessig Trapper");
    spawn(game, "Hill Giant"); // 3 power, but it entered on turn 1
    toStep(game, "precombat-main"); // alice's next turn
    enter(game, "Grizzly Bears");
    activate(game, alena);
    expect(manaOf(game, A, "R")).toBe(2);
  });
});

describe("CMR group c — Belbe, Corrupted Observer", () => {
  it("gives the active player {C}{C} for each of Belbe's controller's opponents who lost life", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Belbe, Corrupted Observer");
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1, who: "each-opponent" }, []);
    toStep(game, "postcombat-main");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0);
    expect(manaOf(game, A, "C")).toBe(4);

    // Bob's turn: carol (alice's opponent) and alice lose life — only carol counts,
    // and the mana is bob's, the active player's.
    nextTurn(game);
    game.debugApplyEffect(B, { kind: "lose-life", amount: 1, who: "each-opponent" }, []);
    const atBobsPostcombat = (s: GameState): boolean =>
      s.turn.step === "postcombat-main" &&
      s.zones.shared.stack.length === 0 &&
      s.pendingTriggers.length === 0 &&
      s.priority.holder === B;
    game.advanceUntil(atBobsPostcombat);
    expect(manaOf(game, B, "C")).toBe(2);
    expect(manaOf(game, A, "C")).toBe(0);
    expect(manaOf(game, C, "C")).toBe(0);
  });
});

describe("CMR group c — Flamekin Herald", () => {
  it("gives commander spells cascade, and no other spell", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    spawn(game, "Flamekin Herald");
    lands(game, "Mountain", 8);
    const cascades = (): number => game.eventsOfType("cascade-revealed").length;

    cast(game, toHand(game, "Hill Giant"));
    expect(cascades()).toBe(0);

    const commander = toHand(game, "Hill Giant");
    game.state.objects[commander].isCommander = true;
    cast(game, commander);
    expect(cascades()).toBe(1);
  });
});

describe("CMR group c — Slurrk, All-Ingesting", () => {
  it("enters with five counters, and its dies trigger sees itself and other creatures with counters", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Slurrk, All-Ingesting"));
    const [slurrk] = named(game, "Slurrk, All-Ingesting");
    expect(counters(game, slurrk)).toBe(5);

    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const plain = spawn(game, "Grizzly Bears");
    for (const id of [bears, giant]) {
      game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(id)]);
    }

    destroy(game, plain); // no counter: nothing
    expect(counters(game, bears)).toBe(1);

    destroy(game, giant); // another creature with a counter
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, slurrk)).toBe(6);

    destroy(game, slurrk); // Slurrk itself
    expect(counters(game, bears)).toBe(3);
  });
});

describe("CMR group c — Halana, Kessig Ranger", () => {
  it("for {2}, the entering creature deals damage equal to its power to target creature", () => {
    const { game, a } = table();
    spawn(game, "Halana, Kessig Ranger");
    lands(game, "Forest", 2);
    const theirs = spawn(game, "Hill Giant", B); // 3/3
    pickModes(a, 0);
    pickTargets(a, theirs);
    enter(game, "Hill Giant"); // 3 power
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("CMR group c — Tuya Bearclaw", () => {
  it("gets +X/+X where X is the greatest power among other creatures you control", () => {
    const { game, a } = table();
    const tuya = spawn(game, "Tuya Bearclaw");
    spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears");
    attack(game, a, [tuya]);
    expect(pt(game, tuya)).toEqual({ power: 5, toughness: 5 });
    expect(life(game, B)).toBe(15);
  });
});

describe("CMR group c — Ich-Tekik, Salvage Splicer", () => {
  it("makes a Golem, and counters go on it and on Ich-Tekik when anyone's artifact dies", () => {
    const { game } = table();
    const ich = enter(game, "Ich-Tekik, Salvage Splicer");
    expect(tokensNamed(game, "Phyrexian Golem Token", A)).toBe(1);
    const [golem] = named(game, "Phyrexian Golem Token");
    destroy(game, spawn(game, "Sol Ring", B));
    expect(counters(game, ich)).toBe(1);
    expect(counters(game, golem)).toBe(1);
  });
});

describe("CMR group c — Amareth, the Lustrous", () => {
  it("takes the top card only when it shares a card type with the entering permanent", () => {
    const { game, a } = table();
    spawn(game, "Amareth, the Lustrous");
    const top = toLibrary(game, "Grizzly Bears");
    let offered = -1;
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible.length;
      return eligible.slice(0, 1);
    };
    enter(game, "Forest"); // a land: the creature card stays on top
    expect(zone(game, top)).toBe("library");
    expect(offered).toBeLessThanOrEqual(0);
    enter(game, "Hill Giant");
    expect(zone(game, top)).toBe("hand");
  });
});

describe("CMR group c — Keskit, the Flesh Sculptor", () => {
  it("sacrifices three other artifacts and/or creatures, then two of three to hand and one to the graveyard", () => {
    const { game } = table();
    const keskit = spawn(game, "Keskit, the Flesh Sculptor");
    const fodder = [spawn(game, "Grizzly Bears"), spawn(game, "Sol Ring"), spawn(game, "Hill Giant")];
    const handBefore = hand(game).length;
    const graveBefore = graveyard(game).length;
    activate(game, keskit);
    expect(fodder.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard", "graveyard"]);
    expect(zone(game, keskit)).toBe("battlefield");
    expect(hand(game).length).toBe(handBefore + 2);
    expect(graveyard(game).length).toBe(graveBefore + 4);
  });
});

describe("CMR group c — Alharu, Solemn Ritualist", () => {
  it("counters two others, then a Spirit for a nontoken creature with a counter dying", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    pickTargets(a, bears, giant);
    enter(game, "Alharu, Solemn Ritualist");
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, giant)).toBe(1);

    destroy(game, spawn(game, "Grizzly Bears")); // no counter
    expect(tokensNamed(game, "Spirit Token", A)).toBe(0);
    destroy(game, bears);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
  });
});
