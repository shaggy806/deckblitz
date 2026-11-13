// Batch 321: the top 5000's next cards by EDHREC rank (4533–), each on the
// feature it needed.

import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import { invalidateComputedCache } from "../characteristics.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  destroy,
  enter,
  life,
  named,
  subtypes,
  pickFromZone,
  pt,
  settle,
  controller,
  counters,
  hand,
  lands,
  loyalty,
  ref,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

type Cast = Extract<Action, { type: "cast-spell" }>;

describe("a required target slot a seat, on a spell (rule 601.2c)", () => {
  it("Blatant Thievery: one permanent from each opponent", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 7);
    const bBear = spawn(game, "Grizzly Bears", B);
    const cBear = spawn(game, "Grizzly Bears", C);
    cast(game, toHand(game, "Blatant Thievery"), { targets: [ref(bBear), ref(cBear), null] });
    expect(controller(game, bBear)).toBe(A);
    expect(controller(game, cBear)).toBe(A);
  });

  it("an opponent still in the game with no permanent: the spell can't be cast", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 7);
    const bBear = spawn(game, "Grizzly Bears", B);
    const thievery = toHand(game, "Blatant Thievery");
    expect(() => cast(game, thievery, { targets: [ref(bBear), null, null] })).toThrow();
    expect(zone(game, thievery)).toBe("hand");
  });

  it("an opponent who has left the game needs no target", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 7);
    const bBear = spawn(game, "Grizzly Bears", B);
    game.state.players[C] = { ...game.state.players[C], hasLost: true };
    cast(game, toHand(game, "Blatant Thievery"), { targets: [ref(bBear), null, null] });
    expect(controller(game, bBear)).toBe(A);
  });
});

describe("Tasha, the Witch Queen", () => {
  it("+1: draws, and exiles one instant or sorcery card from each opponent's graveyard with a page counter", () => {
    const { game } = table({ players: 3 });
    const tasha = spawn(game, "Tasha, the Witch Queen");
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    const divination = toGraveyard(game, "Divination", C);
    const handBefore = hand(game).length;
    loyalty(game, tasha, 1, { targets: [ref(bolt), ref(divination), null] });
    expect(hand(game)).toHaveLength(handBefore + 1);
    for (const card of [bolt, divination]) {
      expect(zone(game, card)).toBe("exile");
      expect(counters(game, card, "page")).toBe(1);
    }
  });

  it("−3: casts from among exiled cards with page counters whoever owns them; a spell she doesn't own makes a Demon", () => {
    const { game, a } = table({ players: 3 });
    const tasha = spawn(game, "Tasha, the Witch Queen");
    const theirs = toExile(game, "Divination", B);
    game.state.objects[theirs].counters = { page: 1 };
    const mine = toExile(game, "Opt", A);
    game.state.objects[mine].counters = { page: 1 };
    toExile(game, "Lightning Bolt", C); // no page counter
    let offered: readonly ObjectId[] = [];
    a.chooseCastNowFn = (_view, offer): Cast => {
      offered = offer.cards;
      return { type: "cast-spell", player: A, card: theirs, targets: [], via: "effect", free: true };
    };
    loyalty(game, tasha, -3);
    expect([...offered].sort()).toEqual([theirs, mine].sort());
    expect(zone(game, theirs)).toBe("graveyard");
    expect(game.state.zones.perPlayer[B].graveyard).toContain(theirs);
    expect(tokensNamed(game, "3/3 Demon Token", A)).toBe(1);
  });

  it("casting a spell she owns makes no Demon", () => {
    const { game } = table();
    spawn(game, "Tasha, the Witch Queen");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(tokensNamed(game, "3/3 Demon Token")).toBe(0);
  });
});

describe("Mechtitan Core", () => {
  it("exiles itself and four other artifact creatures and/or Vehicles; the token leaving returns the four tapped, not the Core", () => {
    const { game, a } = table();
    lands(game, "Wastes", 5);
    const core = spawn(game, "Mechtitan Core");
    const parts = [spawn(game, "Ornithopter"), spawn(game, "Ornithopter"), spawn(game, "Adventurer's Airship"), spawn(game, "Ornithopter")];
    const bear = spawn(game, "Grizzly Bears");
    const ring = spawn(game, "Sol Ring");
    const { offered } = pickFromZone(a, ...parts);
    activate(game, core, 0);
    expect(offered).not.toContain(bear);
    expect(offered).not.toContain(ring);
    expect(offered).not.toContain(core);
    expect(zone(game, core)).toBe("exile");
    for (const part of parts) expect(zone(game, part)).toBe("exile");
    const [titan] = named(game, "Mechtitan Token", A);
    expect(pt(game, titan)).toEqual({ power: 10, toughness: 10 });
    destroy(game, titan);
    settle(game);
    const back = game.state.zones.shared.battlefield.filter((id) => ["Ornithopter", "Adventurer's Airship"].includes(game.state.objects[id].cardName));
    expect(back).toHaveLength(4);
    expect(back.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(zone(game, core)).toBe("exile");
  });

  it("with three others, it can't be activated", () => {
    const { game } = table();
    lands(game, "Wastes", 5);
    const core = spawn(game, "Mechtitan Core");
    for (let i = 0; i < 3; i += 1) spawn(game, "Ornithopter");
    expect(() => activate(game, core, 0)).toThrow();
  });
});

describe("Thran Portal", () => {
  const portal = (game: ReturnType<typeof table>["game"], type: string): ObjectId => {
    const id = spawn(game, "Thran Portal");
    game.state.objects[id].chosenOnEnter = type;
    invalidateComputedCache();
    return id;
  };

  it("is the chosen basic land type in addition to a Gate, with its mana ability", () => {
    const { game } = table();
    const id = portal(game, "Island");
    expect(subtypes(game, id)).toEqual(expect.arrayContaining(["Gate", "Island"]));
  });

  it("its mana ability costs 1 more life, paying for a spell", () => {
    const { game } = table();
    portal(game, "Island");
    const opt = toHand(game, "Opt");
    cast(game, opt);
    expect(zone(game, opt)).toBe("graveyard");
    expect(life(game)).toBe(19);
  });

  it("activated by hand, its mana ability costs 1 life too", () => {
    const { game } = table();
    const id = portal(game, "Swamp");
    activate(game, id, 0);
    expect(game.state.players[A].manaPool).toHaveLength(1);
    expect(life(game)).toBe(19);
  });

  it("a mana ability of another land costs nothing more", () => {
    const { game } = table();
    portal(game, "Island");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(life(game)).toBe(20);
  });

  it("enters tapped with three other lands, untapped with two", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const first = enter(game, "Thran Portal");
    expect(game.state.objects[first].tapped).toBe(false);
    const second = enter(game, "Thran Portal");
    expect(game.state.objects[second].tapped).toBe(true);
  });
});

describe("Guff Rewrites History", () => {
  it("each controller exiles until a nonland card; the casts are offered only after every card is exiled, in turn order", () => {
    const { game, a, b } = table({ deck: "Grizzly Bears" });
    lands(game, "Mountain", 3);
    const mine = spawn(game, "Ornithopter", A);
    const theirs = spawn(game, "Ornithopter", B);
    const offers: string[] = [];
    let mineExiled: ObjectId | undefined;
    a.chooseCastNowFn = (_view, offer): Cast | null => {
      offers.push("a");
      // Bob's card is already in exile when Alice decides.
      expect(game.state.zones.shared.exile.some((id) => game.state.objects[id].owner === B)).toBe(true);
      mineExiled = offer.cards[0];
      return { type: "cast-spell", player: A, card: offer.cards[0], targets: [], via: "effect", free: true };
    };
    b.chooseCastNowFn = () => {
      offers.push("b");
      return null;
    };
    cast(game, toHand(game, "Guff Rewrites History"), { targets: [ref(mine), ref(theirs), null, null] });
    expect(zone(game, mine)).toBe("library");
    expect(zone(game, theirs)).toBe("library");
    expect(offers).toEqual(["a", "b"]);
    expect(mineExiled).toBeDefined();
    expect(zone(game, mineExiled!)).toBe("battlefield");
    // Bob declined: his Bears stays in exile.
    expect(game.state.zones.shared.exile.filter((id) => game.state.objects[id].owner === B)).toHaveLength(1);
  });

  it("a commander its owner puts in the command zone instead still counts: that player exiles", () => {
    const { game, b } = table({ deck: "Grizzly Bears" });
    lands(game, "Mountain", 3);
    const mine = spawn(game, "Ornithopter", A);
    const commander = spawn(game, "Ornithopter", B);
    game.state.objects[commander].isCommander = true;
    let offered = 0;
    b.chooseCastNowFn = (_view, offer) => {
      offered = offer.cards.length;
      return null;
    };
    cast(game, toHand(game, "Guff Rewrites History"), { targets: [ref(mine), ref(commander), null, null] });
    expect(zone(game, commander)).toBe("command");
    expect(offered).toBe(1);
  });

  it("an enchantment or a land isn't a legal target; a player with neither else leaves it uncastable", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const mine = spawn(game, "Ornithopter", A);
    spawn(game, "Forest", B);
    const guff = toHand(game, "Guff Rewrites History");
    expect(() => cast(game, guff, { targets: [ref(mine), null, null, null] })).toThrow();
  });
});
