/**
 * B254 group B — cards freed by the remove-counters-from-chosen,
 * modal-activated-targeted-modes, cast-and-activate-restrictions and
 * amount-fields-dynamic families.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const setCounters = (game: Game, id: ObjectId, kind: string, n: number): void => {
  game.state.objects[id].counters[kind] = n;
};
const permanents = (game: Game, player: PlayerId): ObjectId[] =>
  Object.values(game.state.objects)
    .filter((o) => o.zone === "battlefield" && o.controller === player)
    .map((o) => o.id);
const offersActivation = (game: Game, source: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "activate-ability" && x.source === source);

describe("Phyrexian Obliterator and Ion Storm", () => {
  it("the damaging source's controller sacrifices that many permanents; Ion Storm takes a charge counter", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const storm = spawn(game, "Ion Storm");
    const ring = spawn(game, "Sol Ring");
    setCounters(game, ring, "charge", 1);
    const obliterator = spawn(game, "Phyrexian Obliterator", B);
    // A +1/+1 counter on a creature too: the cost asks which.
    const bear = spawn(game, "Grizzly Bears");
    setCounters(game, bear, "+1/+1", 1);
    let eligible: readonly string[] = [];
    a.chooseCounterRemovalsFn = (_view, offer) => {
      eligible = offer.eligible.map((e) => e.object);
      return [{ object: ring, kind: "charge", count: 1 }];
    };
    const before = permanents(game, A).length;
    const theirs = permanents(game, B).length;
    activate(game, storm, 0, { targets: [ref(obliterator)] });
    expect([...eligible].sort()).toEqual([ring, bear].sort());
    expect(counters(game, ring, "charge")).toBe(0);
    expect(counters(game, bear)).toBe(1);
    expect(game.state.objects[obliterator].damageMarked).toBe(2);
    // Ion Storm's controller — alice — sacrifices two; bob none.
    expect(permanents(game, A)).toHaveLength(before - 2);
    expect(permanents(game, B)).toHaveLength(theirs);
  });
});

describe("Zodiark, Umbral God", () => {
  it("each player sacrifices half their non-God creatures, rounded down, and it grows per creature sacrificed", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    for (let i = 0; i < 3; i++) spawn(game, "Grizzly Bears", B);
    const zodiark = enter(game, "Zodiark, Umbral God");
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(2);
    expect(zone(game, zodiark)).toBe("battlefield");
    expect(counters(game, zodiark)).toBe(2);
  });
});

describe("Rakdos the Defiler", () => {
  it("attacking costs half your non-Demon permanents rounded up; the damaged player loses half theirs", () => {
    const { game, a } = table();
    const rakdos = spawn(game, "Rakdos the Defiler");
    lands(game, "Wastes", 3);
    lands(game, "Wastes", 3, B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    attack(game, a, [rakdos]);
    // Alice: three Wastes, two go; Rakdos is a Demon and stays.
    expect(permanents(game, A)).toHaveLength(2);
    expect(zone(game, rakdos)).toBe("battlefield");
    // Bob: five non-Demon permanents, three go.
    expect(permanents(game, B)).toHaveLength(2);
    expect(life(game, B)).toBe(13);
  });
});

describe("Marath, Will of the Wild", () => {
  it("enters with the mana spent; X counters removed make an X/X, and X can't be 0", () => {
    const { game } = table();
    spawn(game, "Mountain");
    spawn(game, "Forest");
    spawn(game, "Plains");
    lands(game, "Wastes", 2);
    const marath = toHand(game, "Marath, Will of the Wild");
    cast(game, marath);
    expect(counters(game, marath)).toBe(3);
    const base = { type: "activate-ability", player: A, source: marath, abilityIndex: 0, targets: [] } as const;
    expect(game.canDispatch({ ...base, xValue: 0, modes: [2] } as Action)).not.toBeNull();
    activate(game, marath, 0, { x: 2, modes: [2] });
    expect(counters(game, marath)).toBe(1);
    const token = named(game, "Elemental Token (Dance of the Tumbleweeds)", A)[0];
    expect(pt(game, token)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Unexpectedly Absent", () => {
  it("puts the permanent just beneath the top X cards of its owner's library", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    spawn(game, "Grizzly Bears", B);
    const bear = named(game, "Grizzly Bears", B)[0];
    const absent = toHand(game, "Unexpectedly Absent");
    cast(game, absent, { targets: [ref(bear)], x: 2 });
    const library = game.state.zones.perPlayer[B].library;
    expect(library.slice(0, 4).map((id) => game.state.objects[id].cardName)).toEqual([
      "Wastes",
      "Wastes",
      "Grizzly Bears",
      "Wastes",
    ]);
  });
});

describe("Din of the Fireherd", () => {
  it("counts the new black-red Elemental for both sacrifices", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    spawn(game, "Raging Goblin");
    for (let i = 0; i < 3; i++) spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 3, B);
    const din = toHand(game, "Din of the Fireherd");
    cast(game, din, { targets: [ref(B)] });
    expect(tokensNamed(game, "Elemental Token (Din of the Fireherd)")).toBe(1);
    // One black creature (the token); two red (the token, Raging Goblin).
    expect(named(game, "Grizzly Bears", B)).toHaveLength(2);
    expect(named(game, "Wastes", B)).toHaveLength(1);
  });
});

describe("Ulasht, the Hate Seed", () => {
  it("counts a red-and-green creature twice, and its mode makes a Saproling", () => {
    const { game } = table();
    spawn(game, "Raging Goblin");
    spawn(game, "Rip-Clan Crasher");
    lands(game, "Wastes", 1);
    const ulasht = enter(game, "Ulasht, the Hate Seed");
    expect(counters(game, ulasht)).toBe(3);
    activate(game, ulasht, 0, { modes: [1] });
    expect(counters(game, ulasht)).toBe(2);
    expect(tokensNamed(game, "Saproling Token")).toBe(1);
  });
});

describe("Farid, Enterprising Salvager", () => {
  it("sacrificing a nontoken artifact makes Scrap; its first mode grows it and gives menace", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const farid = spawn(game, "Farid, Enterprising Salvager");
    const ring = spawn(game, "Sol Ring");
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: farid,
      abilityIndex: 0,
      targets: [],
      modes: [0],
      sacrifice: ring,
    } as Action);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(zone(game, ring)).toBe("graveyard");
    expect(tokensNamed(game, "Scrap Token")).toBe(1);
    expect(counters(game, farid)).toBe(1);
    expect(keywords(game, farid).has("menace")).toBe(true);
  });
});

describe("Goblin Cratermaker and Phoenix Down", () => {
  it("destroys a colorless nonland permanent, never a colorless land", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const goblin = spawn(game, "Goblin Cratermaker");
    const ring = spawn(game, "Sol Ring", B);
    const wastes = spawn(game, "Wastes", B);
    const base = { type: "activate-ability", player: A, source: goblin, abilityIndex: 0, modes: [1] } as const;
    expect(game.canDispatch({ ...base, targets: [ref(wastes)] } as Action)).not.toBeNull();
    activate(game, goblin, 0, { modes: [1], targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, goblin)).toBe("graveyard");
  });

  it("returns a creature card of mana value 4 or less tapped, not a bigger one", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const down = spawn(game, "Phoenix Down");
    const bear = toGraveyard(game, "Grizzly Bears");
    const dragon = toGraveyard(game, "Shivan Dragon");
    const base = { type: "activate-ability", player: A, source: down, abilityIndex: 0, modes: [0] } as const;
    expect(game.canDispatch({ ...base, targets: [ref(dragon)] } as Action)).not.toBeNull();
    activate(game, down, 0, { modes: [0], targets: [ref(bear)] });
    const back = named(game, "Grizzly Bears", A)[0];
    expect(back).toBeDefined();
    expect(game.state.objects[back].tapped).toBe(true);
    expect(zone(game, down)).toBe("exile");
  });
});

describe("Gnostro, Voice of the Crags", () => {
  it("gains life equal to the spells you've cast this turn", () => {
    const { game } = table();
    const gnostro = spawn(game, "Gnostro, Voice of the Crags");
    cast(game, toHand(game, "Memnite"));
    cast(game, toHand(game, "Memnite"));
    activate(game, gnostro, 0, { modes: [2] });
    expect(life(game, A)).toBe(22);
  });
});

describe("Crucible of the Spirit Dragon", () => {
  it("removes X storage counters for X mana", () => {
    const { game } = table();
    const crucible = spawn(game, "Crucible of the Spirit Dragon");
    setCounters(game, crucible, "storage", 3);
    activate(game, crucible, 2, { x: 2 });
    expect(counters(game, crucible, "storage")).toBe(1);
    expect(game.state.players[A].manaPool).toHaveLength(2);
  });
});

describe("Death Cloud", () => {
  it("each player loses X life, discards X, then sacrifices X creatures and X lands", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 2, B);
    const theirHand = hand(game, B).length;
    const cloud = toHand(game, "Death Cloud");
    cast(game, cloud, { x: 1 });
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);
    expect(hand(game, B)).toHaveLength(theirHand - 1);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(0);
    expect(named(game, "Wastes", B)).toHaveLength(1);
    expect(named(game, "Swamp", A)).toHaveLength(3);
  });
});

describe("Petrify and Planar Disruption", () => {
  it("locks an artifact's mana ability and a planeswalker's loyalty abilities", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const ring = spawn(game, "Sol Ring");
    const jace = spawn(game, "Jace Beleren");
    game.state.objects[jace].counters.loyalty = 3;
    expect(offersActivation(game, ring)).toBe(true);
    expect(offersActivation(game, jace)).toBe(true);
    cast(game, toHand(game, "Petrify"), { targets: [ref(ring)] });
    cast(game, toHand(game, "Planar Disruption"), { targets: [ref(jace)] });
    expect(offersActivation(game, ring)).toBe(false);
    expect(offersActivation(game, jace)).toBe(false);
  });
});
