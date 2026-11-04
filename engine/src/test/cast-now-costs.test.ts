/**
 * What a `cast-now` (rule 608.2g) can ask for the cast: a fixed alternative mana
 * cost (`byPaying`), life equal to the spell's mana value (`byPayingLife`), extra
 * mana on top (`alsoPaying`), mana of any type (`spendAs`), and what it reads from
 * (`graveyardOf`, `zones`, `exiledOwnedWithCounter`), plus "if able" (`mustCast`).
 */
import { describe, expect, it } from "vitest";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toExile,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

type CastNowOffer = Extract<LegalAction, { kind: "cast-now" }>;

const castNowAsked = (game: Game): boolean =>
  game.state.awaiting?.kind === "cast-now" || game.state.result.over;

/** How many of these lands are tapped. */
const tapped = (game: Game, ids: readonly ObjectId[]): number =>
  ids.filter((id) => game.state.objects[id].tapped).length;

const wearer = (game: Game, equipment: ObjectId): ObjectId => {
  const creature = game.state.objects[equipment].attachedTo;
  if (creature === undefined || creature === null) throw new Error("not attached to anything");
  return creature;
};

const exiledNamed = (game: Game, name: string): ObjectId[] =>
  game.state.zones.shared.exile.filter((id) => game.state.objects[id].cardName === name);

describe("byPayingLife (Bismuth Mindrender)", () => {
  it("exiles to that player's nonland card, and casts it for life equal to its mana value", () => {
    const { game, a } = table();
    const render = spawn(game, "Bismuth Mindrender");
    const giant = toLibrary(game, "Hill Giant", B);
    const land = toLibrary(game, "Wastes", B);
    let offer: CastNowOffer | undefined;
    a.chooseCastNowFn = (_v, o) => {
      offer = o;
      return { type: "cast-spell", player: A, card: giant, targets: [], via: "effect", free: true };
    };
    attack(game, a, [render]);
    expect(offer?.byPayingLife).toBe(true);
    expect(zone(game, land)).toBe("exile");
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].controller).toBe(A);
    expect(game.state.objects[giant].owner).toBe(B);
    expect(life(game)).toBe(20 - 4);
  });

  it("isn't offered without the life, and the card stays in exile", () => {
    const { game, a } = table();
    game.state.players[A].life = 3;
    const render = spawn(game, "Bismuth Mindrender");
    const giant = toLibrary(game, "Hill Giant", B);
    let asked = false;
    a.chooseCastNowFn = () => {
      asked = true;
      return null;
    };
    attack(game, a, [render]);
    expect(asked).toBe(false);
    expect(zone(game, giant)).toBe("exile");
    expect(life(game)).toBe(3);
  });

  it("life is the only way: it can't be cast for its mana, and not casting costs nothing", () => {
    const { game, a } = table();
    const render = spawn(game, "Bismuth Mindrender");
    lands(game, "Mountain", 4);
    const giant = toLibrary(game, "Hill Giant", B);
    a.declareAttackersFn = () => [{ attacker: render, defender: B }];
    game.advanceUntil(() => castNowAsked(game));
    expect(
      game.canDispatch({
        type: "cast-now",
        player: A,
        cast: { type: "cast-spell", player: A, card: giant, targets: [], via: "effect" },
      }),
    ).not.toBeNull();
    game.dispatch({ type: "cast-now", player: A, cast: null });
    settle(game);
    expect(zone(game, giant)).toBe("exile");
    expect(life(game)).toBe(20);
  });
});

describe("from several zones (Anrakyr the Traveller)", () => {
  it("offers its artifact spells from the hand and the graveyard together, for life", () => {
    const { game, a } = table();
    const anrakyr = spawn(game, "Anrakyr the Traveller");
    const stone = toGraveyard(game, "Mind Stone");
    const ring = toHand(game, "Sol Ring");
    const bears = toHand(game, "Grizzly Bears");
    let offered: readonly ObjectId[] = [];
    a.chooseCastNowFn = (_v, o) => {
      offered = o.cards;
      return { type: "cast-spell", player: A, card: stone, targets: [], via: "effect", free: true };
    };
    attack(game, a, [anrakyr]);
    expect([...offered].sort()).toEqual([stone, ring].sort());
    expect(offered).not.toContain(bears);
    expect(zone(game, stone)).toBe("battlefield");
    expect(life(game)).toBe(20 - 2);
    expect(zone(game, ring)).toBe("hand");
  });
});

describe("alsoPaying (Ogre Battlecaster)", () => {
  it("costs {R}{R} on top of the card's own cost, pumps by its mana value above the spell, and exiles it", () => {
    const { game, a } = table();
    const ogre = spawn(game, "Ogre Battlecaster");
    const mountains = lands(game, "Mountain", 3);
    const bolt = toGraveyard(game, "Lightning Bolt");
    pickTargets(a, bolt);
    let offer: CastNowOffer | undefined;
    a.chooseCastNowFn = (_v, o) => {
      offer = o;
      return { type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: "effect" };
    };
    a.declareAttackersFn = () => [{ attacker: ogre, defender: B }];
    // The pump goes on the stack above the spell, and resolves first.
    game.advanceUntil(
      (s) => (pt(game, ogre).power === 4 && s.objects[bolt].zone === "stack") || s.turn.step === "postcombat-main",
    );
    expect(zone(game, bolt)).toBe("stack");
    expect(offer?.alsoPaying).toBe("{R}{R}");
    expect(tapped(game, mountains)).toBe(3);
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(zone(game, bolt)).toBe("exile");
    expect(life(game, B)).toBe(20 - 3 - 4);
  });

  it("isn't offered without the extra mana", () => {
    const { game, a } = table();
    const ogre = spawn(game, "Ogre Battlecaster");
    lands(game, "Mountain", 2);
    const bolt = toGraveyard(game, "Lightning Bolt");
    pickTargets(a, bolt);
    let asked = false;
    a.chooseCastNowFn = () => {
      asked = true;
      return null;
    };
    attack(game, a, [ogre]);
    expect(asked).toBe(false);
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("reads the X announced for the spell", () => {
    const { game, a } = table();
    const ogre = spawn(game, "Ogre Battlecaster");
    lands(game, "Mountain", 5);
    const blaze = toGraveyard(game, "Blaze");
    pickTargets(a, blaze);
    a.chooseCastNowFn = () => ({ type: "cast-spell", player: A, card: blaze, targets: [ref(B)], via: "effect", xValue: 2 });
    a.declareAttackersFn = () => [{ attacker: ogre, defender: B }];
    game.advanceUntil((s) => pt(game, ogre).power !== 3 || s.turn.step === "postcombat-main");
    expect(pt(game, ogre).power).toBe(3 + 3);
  });
});

describe("byPaying (Blue Mage's Cane)", () => {
  it("makes a Hero wearing it, and casts the copy for {3} of no colour its own cost asks", () => {
    const { game, a } = table();
    const cane = enter(game, "Blue Mage's Cane");
    const hero = wearer(game, cane);
    expect(pt(game, hero)).toEqual({ power: 1, toughness: 3 });
    expect(subtypes(game, hero)).toContain("Wizard");
    game.state.objects[hero].summoningSick = false;
    lands(game, "Wastes", 3);
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    pickTargets(a, bolt);
    let offer: CastNowOffer | undefined;
    a.chooseCastNowFn = (_v, o) => {
      offer = o;
      return { type: "cast-spell", player: A, card: o.cards[0], targets: [ref(B)], via: "effect" };
    };
    attack(game, a, [hero]);
    expect(offer?.byPaying).toBe("{3}");
    expect(zone(game, bolt)).toBe("exile");
    expect(life(game, B)).toBe(20 - 3 - 1);
    // The copy is gone; the card it copied stays in exile.
    expect(exiledNamed(game, "Lightning Bolt")).toEqual([bolt]);
    expect(graveyard(game, A).some((id) => game.state.objects[id].cardName === "Lightning Bolt")).toBe(false);
  });

  it("the copy isn't offered without {3}, even with its own cost's mana", () => {
    const { game, a } = table();
    const cane = enter(game, "Blue Mage's Cane");
    const hero = wearer(game, cane);
    game.state.objects[hero].summoningSick = false;
    lands(game, "Mountain", 2);
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    pickTargets(a, bolt);
    let asked = false;
    a.chooseCastNowFn = () => {
      asked = true;
      return null;
    };
    attack(game, a, [hero]);
    expect(asked).toBe(false);
    expect(zone(game, bolt)).toBe("exile");
    expect(life(game, B)).toBe(20 - 1);
  });
});

describe("spendAs (Tinybones, the Pickpocket; Quistis Trepe)", () => {
  it("Tinybones casts a green creature card from that player's graveyard with black mana, for that cast alone", () => {
    const { game, a } = table();
    const bones = spawn(game, "Tinybones, the Pickpocket");
    const swamps = lands(game, "Swamp", 4);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    let offer: CastNowOffer | undefined;
    a.chooseCastNowFn = (_v, o) => {
      offer = o;
      return { type: "cast-spell", player: A, card: bears, targets: [], via: "effect" };
    };
    attack(game, a, [bones]);
    expect(offer?.anyMana).toBe(true);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
    expect(tapped(game, swamps)).toBe(2);
    // Mana of any type was for that cast: another green spell gets no such help.
    const other = toHand(game, "Grizzly Bears");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: other, targets: [] })).not.toBeNull();
  });

  it("needs the mana all the same, and a land card isn't a target", () => {
    const { game, a } = table();
    const bones = spawn(game, "Tinybones, the Pickpocket");
    lands(game, "Swamp", 1);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const wastes = toGraveyard(game, "Wastes", B);
    const stone = toGraveyard(game, "Mind Stone", B);
    let slot: readonly unknown[] = [];
    a.chooseTargetsFn = (_v, _n, _s, options) => {
      slot = options[0];
      return [ref(bears)];
    };
    let asked = false;
    a.chooseCastNowFn = () => {
      asked = true;
      return null;
    };
    attack(game, a, [bones]);
    expect(slot).toContainEqual(ref(bears));
    expect(slot).toContainEqual(ref(stone));
    expect(slot).not.toContainEqual(ref(wastes));
    expect(asked).toBe(false);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Quistis casts another player's spell with blue mana, and it's exiled, not put in its owner's graveyard", () => {
    const { game, a } = table();
    const island = lands(game, "Island", 1);
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    pickTargets(a, bolt);
    a.chooseCastNowFn = () => ({ type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: "effect" });
    enter(game, "Quistis Trepe");
    expect(tapped(game, island)).toBe(1);
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("exile");
  });
});

describe("graveyardOf (Sorcerous Squall)", () => {
  it("offers the spells of that player's graveyard after the mill, free, and exiles the one cast", () => {
    const { game, a } = table();
    lands(game, "Island", 9);
    const mine = toGraveyard(game, "Divination");
    const bolt = toLibrary(game, "Lightning Bolt", B);
    const bears = toLibrary(game, "Grizzly Bears", B);
    for (let i = 0; i < 7; i += 1) toLibrary(game, "Wastes", B);
    let offered: readonly ObjectId[] = [];
    a.chooseCastNowFn = (_v, o) => {
      offered = o.cards;
      return { type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: "effect", free: true };
    };
    cast(game, toHand(game, "Sorcerous Squall"), { targets: [ref(B)] });
    expect(offered).toEqual([bolt]);
    expect(offered).not.toContain(mine);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("exile");
    expect(life(game, B)).toBe(17);
  });
});

describe("exiledOwnedWithCounter (Zethi, Arcane Blademaster)", () => {
  it("exiles up to as many instants as it was kicked, then copies each with a kick counter on every attack", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const bolt = toGraveyard(game, "Lightning Bolt");
    const shock = toGraveyard(game, "Shock");
    const left = toGraveyard(game, "Lightning Helix");
    a.chooseTargetsFn = (_v, _n, _s, options) => {
      expect(options[0]).toContainEqual(ref(left));
      return [ref(bolt), ref(shock)];
    };
    const zethiCard = toHand(game, "Zethi, Arcane Blademaster");
    lands(game, "Plains", 1);
    lands(game, "Mountain", 1);
    cast(game, zethiCard, { kicked: true, kickCount: 2 });
    const zethi = zethiCard;
    expect(zone(game, zethi)).toBe("battlefield");
    expect(counters(game, bolt, "kick")).toBe(1);
    expect(counters(game, shock, "kick")).toBe(1);
    expect(zone(game, left)).toBe("graveyard");
    // Unmarked, or someone else's: not copied.
    const plain = toExile(game, "Divination");
    const theirs = toExile(game, "Divination", B);
    game.state.objects[theirs].counters.kick = 1;

    game.state.objects[zethi].summoningSick = false;
    for (const land of game.state.zones.shared.battlefield) game.state.objects[land].tapped = false;
    const seen: (readonly ObjectId[])[] = [];
    a.chooseCastNowFn = (_v, o) => {
      seen.push(o.cards);
      if (seen.length > 1) return null;
      const bolts = o.cards.filter((id) => game.state.objects[id].cardName === "Lightning Bolt");
      return { type: "cast-spell", player: A, card: bolts[0], targets: [ref(B)], via: "effect" };
    };
    attack(game, a, [zethi]);
    expect(seen[0]).toHaveLength(2);
    expect(seen[0]).not.toContain(bolt);
    expect(seen[0]).not.toContain(plain);
    expect(life(game, B)).toBe(20 - 3 - 3);
    // The originals stay, marked; no copy is left to be copied again.
    expect(exiledNamed(game, "Lightning Bolt")).toEqual([bolt]);
    expect(exiledNamed(game, "Shock")).toEqual([shock]);
  });
});

describe("mustCast (Omen Machine; Spelltwine)", () => {
  it("no player can draw; a land goes onto the battlefield, and anything else is cast though its player would decline", () => {
    const { game, b } = table();
    spawn(game, "Omen Machine");
    const land = toLibrary(game, "Mountain", B);
    const handBefore = hand(game, B).length;
    nextTurn(game);
    expect(zone(game, land)).toBe("battlefield");
    expect(game.state.objects[land].controller).toBe(B);
    expect(hand(game, B).length).toBe(handBefore);
    let offer: CastNowOffer | undefined;
    const alice = toLibrary(game, "Grizzly Bears", A);
    expect(zone(game, alice)).toBe("library");
    nextTurn(game);
    expect(zone(game, alice)).toBe("battlefield");
    const bears = toLibrary(game, "Hill Giant", B);
    b.chooseCastNowFn = (_v, o) => {
      offer = o;
      return null;
    };
    nextTurn(game);
    expect(offer?.mustCast).toBe(true);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(B);
  });

  it("refuses a decline as an answer", () => {
    const { game } = table();
    spawn(game, "Omen Machine");
    toLibrary(game, "Hill Giant", B);
    game.advanceUntil(() => castNowAsked(game));
    expect(game.canDispatch({ type: "cast-now", player: B, cast: null })).not.toBeNull();
  });

  it("a card that can't be cast stays in exile, and nobody is asked", () => {
    const { game, b } = table();
    spawn(game, "Omen Machine");
    const murder = toLibrary(game, "Murder", B);
    let asked = false;
    b.chooseCastNowFn = () => {
      asked = true;
      return null;
    };
    nextTurn(game);
    expect(asked).toBe(false);
    expect(zone(game, murder)).toBe("exile");
  });

  it("a cost increase needing a mana ability leaves it a choice (rule 118.3c), and floating mana doesn't (118.3a)", () => {
    const declined = table();
    spawn(declined.game, "Omen Machine");
    spawn(declined.game, "Thalia, Guardian of Thraben");
    lands(declined.game, "Wastes", 2, B);
    const spell = toLibrary(declined.game, "Divination", B);
    let offer: CastNowOffer | undefined;
    declined.b.chooseCastNowFn = (_v, o) => {
      offer = o;
      return null;
    };
    nextTurn(declined.game);
    expect(offer).toBeDefined();
    expect(offer?.mustCast).toBeUndefined();
    expect(zone(declined.game, spell)).toBe("exile");

    const forced = table();
    spawn(forced.game, "Omen Machine");
    spawn(forced.game, "Thalia, Guardian of Thraben");
    lands(forced.game, "Wastes", 2, B);
    const spell2 = toLibrary(forced.game, "Divination", B);
    // Floating as the trigger resolves: Bob's mana from his upkeep, kept by hand.
    forced.game.advanceUntil(() => castNowAsked(forced.game) || forced.game.state.turn.step === "draw");
    forced.game.state.players[B].manaPool = [{ type: "C" }] as never;
    let forcedOffer: CastNowOffer | undefined;
    forced.b.chooseCastNowFn = (_v, o) => {
      forcedOffer = o;
      return null;
    };
    forced.game.advanceUntil(() => zone(forced.game, spell2) !== "library" && forced.game.state.zones.shared.stack.length === 0);
    expect(forcedOffer?.mustCast).toBe(true);
  });

  it("a mandatory additional cost with a stated quality in a hidden zone needn't be paid (rule 118.8c)", () => {
    const { game, b } = table();
    spawn(game, "Omen Machine");
    toHand(game, "Mountain", B);
    const insight = toLibrary(game, "Magmatic Insight", B);
    let offer: CastNowOffer | undefined;
    b.chooseCastNowFn = (_v, o) => {
      offer = o;
      return null;
    };
    nextTurn(game);
    expect(offer).toBeDefined();
    expect(offer?.mustCast).toBeUndefined();
    expect(zone(game, insight)).toBe("exile");
  });

  it("Spelltwine exiles both, casts both copies if able, and exiles itself", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const mine = toGraveyard(game, "Lightning Bolt");
    const theirs = toGraveyard(game, "Divination", B);
    const handBefore = hand(game, A).length;
    // Bolt's first target is the first offered; either way it was cast.
    const before = life(game) + life(game, B);
    a.chooseCastNowFn = () => null;
    const twine = toHand(game, "Spelltwine");
    cast(game, twine, { targets: [ref(mine), ref(theirs)] });
    expect(zone(game, twine)).toBe("exile");
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    expect(life(game) + life(game, B)).toBe(before - 3);
    // Spelltwine left the hand; the copy of Divination drew two.
    expect(hand(game, A).length).toBe(handBefore + 2);
    expect(exiledNamed(game, "Lightning Bolt")).toEqual([mine]);
    expect(exiledNamed(game, "Divination")).toEqual([theirs]);
  });

  it("Spelltwine's copy with no legal target is left to cease to exist", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const mine = toGraveyard(game, "Divination");
    const theirs = toGraveyard(game, "Murder", B);
    a.chooseCastNowFn = () => null;
    const handBefore = hand(game, A).length;
    cast(game, toHand(game, "Spelltwine"), { targets: [ref(mine), ref(theirs)] });
    expect(hand(game, A).length).toBe(handBefore + 2);
    expect(exiledNamed(game, "Murder")).toEqual([theirs]);
  });
});
