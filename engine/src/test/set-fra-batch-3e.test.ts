/**
 * Reality Fracture (FRA) and its Commander set (FRC), batch 3, part e
 * (2026-10-14): the rest of the set's cards. Written on the shared table in
 * `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** The prepare spell copies in exile. */
const preparedCopies = (game: Game): ObjectId[] =>
  game.state.zones.shared.exile.filter((id) => game.state.objects[id].preparedFor !== undefined);

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("Primal Witchstalker", () => {
  it("mills four, then returns a land card from your graveyard tapped", () => {
    const { game, a } = table();
    // The table's library is all Wastes: the four milled are land cards.
    const forest = toGraveyard(game, "Forest");
    pickTargets(a, forest);
    enter(game, "Primal Witchstalker");
    expect(graveyard(game)).toHaveLength(4);
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
  });

  it("doesn't return anything when fewer than four cards were milled (Wick's Patrol's ruling)", () => {
    const { game, a } = table();
    const forest = toGraveyard(game, "Forest");
    let asked = 0;
    a.chooseTargetsFn = (_view, _name, _specs, legal) => {
      asked += 1;
      return legal.map((slot) => slot[0] ?? null);
    };
    // Leave three cards in the library.
    (library(game) as ObjectId[]).splice(3);
    enter(game, "Primal Witchstalker");
    expect(library(game)).toHaveLength(0);
    expect(asked).toBe(0);
    expect(zone(game, forest)).toBe("graveyard");
  });
});

describe("Karn, Gilded Guardian", () => {
  it("draws one card per color among the other artifacts you control, not counting itself", () => {
    const { game } = table();
    spawn(game, "+2 Mace"); // white
    spawn(game, "A.I.M. Bot"); // blue
    spawn(game, "Ornithopter"); // colourless
    spawn(game, "A.I.M. Bot", B); // an opponent's: not counted
    const before = hand(game).length;
    enter(game, "Karn, Gilded Guardian");
    expect(hand(game)).toHaveLength(before + 2);
  });
});

describe("Edgar, Ancient Bloodlord", () => {
  it("sacrifices another creature for a counter and menace, gaining 1 life as it dies", () => {
    const { game } = table();
    const edgar = spawn(game, "Edgar, Ancient Bloodlord");
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    const sac = (victim: ObjectId) =>
      game.dispatch({ type: "activate-ability", player: A, source: edgar, abilityIndex: 0, targets: [], sacrifice: victim });
    // "Another": Edgar can't pay with himself.
    expect(() => sac(edgar)).toThrow();
    sac(bear);
    settle(game);
    expect(zone(game, bear)).toBe("graveyard");
    expect(counters(game, edgar)).toBe(1);
    expect(keywords(game, edgar).has("menace")).toBe(true);
    expect(life(game)).toBe(21);
  });
});

describe("Fatehold Chronologist // Peer Review", () => {
  it("enters prepared, and Peer Review makes a Cadet and surveils 1", () => {
    const { game } = table();
    const bird = enter(game, "Fatehold Chronologist");
    const [copy] = preparedCopies(game);
    expect(game.state.objects[copy].cardName).toBe("Peer Review");
    lands(game, "Plains", 3);
    cast(game, copy, { via: "prepared" });
    expect(tokensNamed(game, "Cadet", A)).toBe(1);
    expect(game.state.objects[bird].prepared).toBeUndefined();
  });
});

describe("Something Worth Saving", () => {
  it("puts a permanent card from among the milled cards into your hand, and gains 1 life", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const spell = toHand(game, "Something Worth Saving");
    const before = hand(game).length;
    a.chooseFromZoneFn = (_view, eligible) => {
      expect(eligible).toHaveLength(4);
      return [eligible[0]];
    };
    cast(game, spell);
    // −1 the spell, +1 a milled Wastes.
    expect(hand(game)).toHaveLength(before);
    expect(graveyard(game)).toHaveLength(4); // three Wastes and the spell
    expect(life(game)).toBe(21);
  });
});

describe("Hapatra, the Desert Frost", () => {
  it("taps up to one creature of each opponent and stuns each", () => {
    const { game, a } = table({ players: 3 });
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Grizzly Bears", C);
    pickTargets(a, bobs, carols);
    enter(game, "Hapatra, the Desert Frost");
    for (const id of [bobs, carols]) {
      expect(game.state.objects[id].tapped).toBe(true);
      expect(counters(game, id, "stun")).toBe(1);
    }
  });

  it("may choose no creature for an opponent", () => {
    const { game, a } = table({ players: 3 });
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Grizzly Bears", C);
    pickTargets(a, null, carols);
    enter(game, "Hapatra, the Desert Frost");
    expect(game.state.objects[bobs].tapped).toBe(false);
    expect(counters(game, bobs, "stun")).toBe(0);
    expect(counters(game, carols, "stun")).toBe(1);
  });
});

describe("Screeching Soulbreaker", () => {
  it("deals 1 damage to each opponent and gains you 1 life when it attacks", () => {
    const { game, a } = table({ players: 3 });
    const siren = spawn(game, "Screeching Soulbreaker");
    attack(game, a, [siren]);
    // Bob also takes the 1 combat damage.
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(19);
    expect(life(game)).toBe(21);
  });
});

describe("Pia, Determined Rebuilder", () => {
  it("makes a Thopter, and gives +X/+0 where X is the artifacts you control", () => {
    const { game } = table();
    const pia = enter(game, "Pia, Determined Rebuilder");
    expect(tokensNamed(game, "Thopter Token", A)).toBe(1);
    spawn(game, "Ornithopter");
    spawn(game, "Ornithopter", B);
    lands(game, "Mountain", 6);
    activate(game, pia, 0, { targets: [ref(pia)] });
    expect(pt(game, pia)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Hexhaven Battalion", () => {
  it("makes three Cadets and empowers Jace 2", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Hexhaven Battalion"));
    expect(tokensNamed(game, "Cadet", A)).toBe(3);
    const [jace] = named(game, "Jace Token", A);
    expect(counters(game, jace, "loyalty")).toBe(2);
  });
});

describe("Extended Absence", () => {
  it("exiles a creature, deals 1 damage to each opponent and gains you 1 life", () => {
    const { game } = table({ players: 3 });
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Extended Absence"), { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("exile");
    expect([life(game, B), life(game, C), life(game)]).toEqual([19, 19, 21]);
  });
});

describe("Icy Reception", () => {
  it("can target a creature or legendary spell, but not another spell", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 2);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    const icy = toHand(game, "Icy Reception");
    expect(() => cast(game, icy, { targets: [ref(bolt)], modes: [0], settle: false })).toThrow();
    const bears = toHand(game, "Grizzly Bears");
    settle(game);
    cast(game, bears, { settle: false });
    // Alice has no mana left to pay {3}: her Bears are countered.
    cast(game, icy, { targets: [ref(bears)], modes: [0] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("gives a creature -5/-0", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Icy Reception"), { targets: [ref(giant)], modes: [1] });
    expect(pt(game, giant)).toEqual({ power: -2, toughness: 3 });
  });
});

describe("Refute Destiny", () => {
  it("exiles a green or blue creature, never one of another colour, and surveils 1", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const elves = spawn(game, "Llanowar Elves", B);
    const goblin = spawn(game, "Raging Goblin", B);
    const refute = toHand(game, "Refute Destiny");
    expect(() => cast(game, refute, { targets: [ref(goblin)] })).toThrow();
    cast(game, refute, { targets: [ref(elves)] });
    expect(zone(game, elves)).toBe("exile");
    expect(zone(game, goblin)).toBe("battlefield");
  });
});

describe("Apex Witchstalker", () => {
  it("gains 2 life when it enters and 2 more when it dies", () => {
    const { game } = table();
    const wolf = enter(game, "Apex Witchstalker");
    expect(life(game)).toBe(22);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(wolf)]);
    settle(game);
    expect(life(game)).toBe(24);
  });
});

describe("Arni, Renowned Champion", () => {
  it("gets +X/+0 where X is the entering creature's power, and not for an opponent's creature", () => {
    const { game } = table();
    const arni = spawn(game, "Arni, Renowned Champion");
    enter(game, "Hill Giant");
    expect(pt(game, arni)).toEqual({ power: 4, toughness: 5 });
    enter(game, "Hill Giant", B);
    expect(pt(game, arni)).toEqual({ power: 4, toughness: 5 });
  });
});

describe("Awaken the Inferno", () => {
  it("deals 6 to an opponent's creature and puts a counter on up to one of yours", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const theirs = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Awaken the Inferno"), { targets: [ref(theirs), ref(mine)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(counters(game, mine)).toBe(1);
  });

  it("needs no creature of yours", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const theirs = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Awaken the Inferno"), { targets: [ref(theirs), null] });
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Living Library", () => {
  it("shuffles an opponent's creature into its owner's library", () => {
    const { game } = table();
    const book = spawn(game, "Living Library");
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 6);
    activate(game, book, 0, { targets: [ref(bear)] });
    expect(zone(game, book)).toBe("graveyard");
    expect(zone(game, bear)).toBe("library");
    expect(library(game, B)).toContain(bear);
  });
});

describe("Predictive Preparations", () => {
  it("puts a counter on each of two different creatures, and on just one", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const first = spawn(game, "Grizzly Bears");
    const second = spawn(game, "Grizzly Bears", B);
    const prep = toHand(game, "Predictive Preparations");
    expect(() => cast(game, prep, { targets: [ref(first), ref(first)] })).toThrow();
    cast(game, prep, { targets: [ref(first), ref(second)] });
    expect([counters(game, first), counters(game, second)]).toEqual([1, 1]);

    // Flashback from the graveyard, one target.
    lands(game, "Plains", 4);
    cast(game, prep, { targets: [ref(first), null], via: "flashback" });
    expect(counters(game, first)).toBe(2);
    expect(zone(game, prep)).toBe("exile");
  });
});

describe("Afterthought Sentry", () => {
  it("exiles up to one card from a graveyard when it attacks", () => {
    const { game, a } = table();
    const sentry = spawn(game, "Afterthought Sentry");
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    attack(game, a, [sentry]);
    expect(zone(game, theirs)).toBe("exile");
  });
});

describe("Tether Technician", () => {
  it("deals 2 damage to any target when you discard a card", () => {
    const { game, a } = table();
    toHand(game, "Grizzly Bears");
    pickModes(a, 0);
    pickTargets(a, B);
    enter(game, "Tether Technician");
    expect(life(game, B)).toBe(18);
    expect(graveyard(game).length).toBe(1);
  });

  it("deals nothing when you decline, or have nothing to discard", () => {
    const { game, a } = table();
    pickModes(a);
    pickTargets(a, B);
    enter(game, "Tether Technician");
    expect(life(game, B)).toBe(20);

    const empty = table();
    (empty.game.state.zones.perPlayer[A].hand as ObjectId[]).splice(0);
    pickModes(empty.a, 0);
    pickTargets(empty.a, B);
    enter(empty.game, "Tether Technician");
    expect(life(empty.game, B)).toBe(20);
  });
});

describe("Venser, Fervent Forger", () => {
  /** The seat picks the mode whose text starts with `prefix` (only modes
   * with a legal target are offered). */
  const pickMode = (seat: ReturnType<typeof table>["a"], prefix: string): void => {
    seat.chooseModesFn = (_view, _min, _max, labels) => [labels.findIndex((label) => label.startsWith(prefix))];
  };

  it("copies an opponent's instant twice, with new targets for the copies", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    const venser = toHand(game, "Venser, Fervent Forger");
    toStep(game, "precombat-main", B);
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    cast(game, bolt, { player: B, targets: [ref(A)], settle: false });
    game.dispatch({ type: "pass-priority", player: B });
    // Flashed in response: its trigger sees the Bolt on the stack.
    pickMode(a, "Copy");
    // The trigger targets the Bolt; each copy is retargeted at Bob.
    a.chooseTargetsFn = (_view, _name, _specs, legal) =>
      legal.map((slot): TargetRef | null =>
        slot.some((t) => t.kind === "object" && t.object === bolt) ? ref(bolt) : ref(B),
      );
    cast(game, venser);
    expect(life(game, B)).toBe(14);
    expect(life(game)).toBe(17);
  });

  it("makes two hasty token copies of an opponent's permanent under your control, sacrificed at the next end step", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickMode(a, "Create");
    pickTargets(a, giant);
    enter(game, "Venser, Fervent Forger");
    const copies = named(game, "Hill Giant", A);
    expect(tokensNamed(game, "Hill Giant", A)).toBe(2);
    expect(copies.every((id) => keywords(game, id).has("haste"))).toBe(true);
    expect(zone(game, giant)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Hill Giant", A)).toBe(0);
  });
});
