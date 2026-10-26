/**
 * Dissension (DIS; B201), group E. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

/** Empty `player`'s hand. */
function emptyHand(game: Game, player: PlayerId = A): void {
  game.debugApplyEffect(player, { kind: "discard-hand", who: "you" }, []);
  settle(game);
}

describe("Anthem of Rakdos", () => {
  it("pumps each attacker and pings you; hellbent doubles your damage, its own ping included", () => {
    const { game, a } = table();
    spawn(game, "Anthem of Rakdos");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(16);

    const second = table();
    spawn(second.game, "Anthem of Rakdos");
    const bears2 = spawn(second.game, "Grizzly Bears");
    emptyHand(second.game);
    expect(hand(second.game, A)).toHaveLength(0);
    attack(second.game, second.a, [bears2]);
    expect(life(second.game, A)).toBe(18);
    expect(life(second.game, B)).toBe(12);
  });
});

describe("Hellhole Rats", () => {
  it("deals damage equal to the discarded card's mana value", () => {
    const { game, a } = table();
    emptyHand(game, B);
    toHand(game, "Grizzly Bears", B);
    pickTargets(a, B);
    enter(game, "Hellhole Rats");
    expect(hand(game, B)).toHaveLength(0);
    expect(life(game, B)).toBe(18);
  });
});

describe("Hit // Run", () => {
  it("Hit deals damage equal to the sacrificed permanent's mana value", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Hit // Run"), { face: 1, targets: [ref(B)] });
    expect(named(game, "Grizzly Bears", B)).toHaveLength(0);
    expect(life(game, B)).toBe(18);
  });

  it("Run gives each attacker +1/+0 for each other attacking creature", () => {
    const { game, a } = table();
    const attackers = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    lands(game, "Mountain", 2);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 2);
    a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    cast(game, toHand(game, "Hit // Run"), { face: 2 });
    expect(pt(game, attackers[0])).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, attackers[2])).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Supply // Demand", () => {
  it("Supply makes X Saprolings; Demand finds a multicolored card", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    lands(game, "Plains", 2);
    lands(game, "Island", 1);
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Supply // Demand"), { face: 1, x: 2 });
    expect(tokensNamed(game, "Saproling Token", A)).toBe(2);

    game.debugSpawn("Azorius Guildmage", A, "library");
    game.debugSpawn("Grizzly Bears", A, "library");
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Supply // Demand"), { face: 2 });
    const now = hand(game, A);
    expect(now).toHaveLength(before + 1);
    expect(now.some((id) => game.state.objects[id].cardName === "Azorius Guildmage")).toBe(true);
  });
});

describe("Wit's End", () => {
  it("makes the target discard their whole hand", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Wastes", 5);
    expect(hand(game, B).length).toBeGreaterThan(0);
    cast(game, toHand(game, "Wit's End"), { targets: [ref(B)] });
    expect(hand(game, B)).toHaveLength(0);
  });
});

describe("Biomantic Mastery", () => {
  it("draws for each creature of each of the two target players", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 3);
    lands(game, "Wastes", 4);
    const card = toHand(game, "Biomantic Mastery");
    const before = hand(game, A).length - 1;
    cast(game, card, { targets: [ref(B), ref(A)] });
    expect(hand(game, A)).toHaveLength(before + 3);
  });
});

describe("Bond of Agony", () => {
  it("costs X life and each other player loses X", () => {
    const { game } = table({ players: 3 });
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Bond of Agony"), { x: 3 });
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);
    expect(game.state.players["carol" as PlayerId].life).toBe(17);
  });
});

describe("Avatar of Discord", () => {
  it("stays if two cards are discarded, and is sacrificed with fewer than two in hand", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const before = hand(game, A).length;
    const avatar = enter(game, "Avatar of Discord");
    expect(zone(game, avatar)).toBe("battlefield");
    expect(hand(game, A)).toHaveLength(before - 2);

    emptyHand(game);
    toHand(game, "Grizzly Bears");
    const second = enter(game, "Avatar of Discord");
    expect(zone(game, second)).toBe("graveyard");
    expect(hand(game, A)).toHaveLength(1);
  });
});

describe("Slaughterhouse Bouncer", () => {
  it("gives -3/-3 when it dies only while you're hellbent", () => {
    const { game, a } = table();
    const victim = spawn(game, "Grizzly Bears", B);
    pickTargets(a, victim);
    destroy(game, spawn(game, "Slaughterhouse Bouncer"));
    expect(zone(game, victim)).toBe("battlefield");
    emptyHand(game);
    destroy(game, spawn(game, "Slaughterhouse Bouncer"));
    expect(zone(game, victim)).toBe("graveyard");
  });
});

describe("Demon's Jester", () => {
  it("is 4/3 while you're hellbent", () => {
    const { game } = table();
    const jester = spawn(game, "Demon's Jester");
    expect(pt(game, jester)).toEqual({ power: 2, toughness: 2 });
    emptyHand(game);
    expect(pt(game, jester)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Ocular Halo, Freewind Equenaut, Flaring Flame-Kin", () => {
  it("grants the draw ability, and turns on each creature's enchanted bonus", () => {
    const { game, a } = table();
    lands(game, "Island", 8);
    const kin = spawn(game, "Flaring Flame-Kin");
    expect(pt(game, kin)).toEqual({ power: 2, toughness: 2 });
    cast(game, toHand(game, "Ocular Halo"), { targets: [ref(kin)] });
    expect(pt(game, kin)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, kin).has("trample")).toBe(true);

    const equenaut = spawn(game, "Freewind Equenaut");
    const offered = (): number =>
      game.legalActions(A).filter((x) => x.kind === "activate-ability" && x.source === equenaut).length;
    expect(offered()).toBe(0);
    cast(game, toHand(game, "Ocular Halo"), { targets: [ref(equenaut)] });
    expect(offered()).toBe(1);
    // With an attacking creature to target, the enchanted Equenaut's ping is offered too.
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    expect(offered()).toBe(2);
  });
});

describe("Proper Burial", () => {
  it("gains life equal to a dying creature's toughness", () => {
    const { game } = table();
    spawn(game, "Proper Burial");
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(life(game, A)).toBe(22);
  });
});

describe("Rakdos Guildmage", () => {
  it("makes a hasty Goblin that's exiled at the next end step", () => {
    const { game } = table();
    const mage = spawn(game, "Rakdos Guildmage");
    lands(game, "Mountain", 4);
    game.dispatch({ type: "activate-ability", player: A, source: mage, abilityIndex: 1, targets: [] });
    settle(game);
    const [goblin] = named(game, "Goblin Token (Rakdos Guildmage)", A);
    expect(keywords(game, goblin).has("haste")).toBe(true);
    nextTurn(game);
    expect(named(game, "Goblin Token (Rakdos Guildmage)", A)).toHaveLength(0);
    expect(graveyard(game, A).includes(goblin)).toBe(false);
  });
});
