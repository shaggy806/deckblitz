/**
 * Batch 255, group B: cards a built feature freed — piles, hand exile, a target's
 * controller, an opponent's chosen target and creature, a count per player.
 */
import { describe, expect, it } from "vitest";

import { restrictionsOf } from "../characteristics.js";
import type { Action, LegalAction } from "../actions.js";
import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  attack,
  blockOffer,
  cast,
  counters,
  destroy,
  enter,
  grant,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  watchTargets,
  zone,
  type Table,
} from "./harness.js";

type Offer = Extract<LegalAction, { kind: "cast-now" }>;
type Cast = Extract<Action, { type: "cast-spell" }>;

/** The seat casts `want` in turn, by name, then declines, recording each offer. */
function casting(seat: ScriptedController, want: readonly string[]): Offer[] {
  const offers: Offer[] = [];
  const left = [...want];
  seat.chooseCastNowFn = (_view, offer): Cast | null => {
    offers.push(offer);
    const name = left.shift();
    if (name === undefined) return null;
    const way = offer.casts.find((c) => c.cardName === name);
    if (way === undefined) throw new Error(`${name} isn't on offer: ${offer.casts.map((c) => c.cardName).join(", ")}`);
    return { type: "cast-spell", player: A, card: way.card, targets: [], via: "effect", free: true };
  };
  return offers;
}

const offeredNames = (offer: Offer): readonly string[] => [...new Set(offer.casts.map((c) => c.cardName))].sort();
const cantBlock = (t: Table, id: ObjectId): boolean => restrictionsOf(t.game.state, registryOf(t.game), id).has("cant-block");

describe("freed cards, group B", () => {
  it("Tataru Taru: a tapped Treasure when an opponent draws off their own turn, once a turn", () => {
    const { game, a, b } = table({ players: 3 });
    const mine = hand(game, A).length;
    const bobs = hand(game, B).length;
    pickTargets(a, B);
    pickModes(b, 0);
    enter(game, "Tataru Taru");
    expect(hand(game, A).length).toBe(mine + 1);
    expect(hand(game, B).length).toBe(bobs + 1);
    // Bob's "may" drew on Alice's turn: that's the ability's one this turn.
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(game.state.objects[named(game, "Treasure Token", A)[0]].tapped).toBe(true);
    game.debugApplyEffect(C, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    // Bob's own turn: his draw step's draw doesn't trigger it, nor use it up.
    nextTurn(game);
    expect(game.state.turnOrder[game.state.turn.activePlayerIndex]).toBe(B);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    game.debugApplyEffect(B, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    // Carol on Bob's turn: an opponent, not on her own turn.
    game.debugApplyEffect(C, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });

  it("Invoke Calamity: two spells from hand and graveyard within 6 total, exiled after, and itself", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    const divination = toGraveyard(game, "Divination");
    const ritual = toHand(game, "Dark Ritual");
    toHand(game, "Hill Giant");
    toHand(game, "Thrill of Possibility");
    const invoke = toHand(game, "Invoke Calamity");
    const offers = casting(a, ["Divination", "Dark Ritual"]);
    const before = hand(game, A).length;
    cast(game, invoke);
    expect(offeredNames(offers[0])).toEqual(["Dark Ritual", "Divination", "Thrill of Possibility"]);
    expect(offeredNames(offers[1])).toEqual(["Dark Ritual", "Thrill of Possibility"]);
    expect(offers).toHaveLength(2);
    expect([zone(game, divination), zone(game, ritual), zone(game, invoke)]).toEqual(["exile", "exile", "exile"]);
    // Less Invoke Calamity and the Ritual, plus Divination's two.
    expect(hand(game, A).length).toBe(before - 2 + 2);
  });

  it("Invoke Calamity: a spell that no longer fits the total isn't offered, and declining ends it", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    toGraveyard(game, "Divination");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Divination");
    const offers = casting(a, ["Divination", "Divination"]);
    cast(game, toHand(game, "Invoke Calamity"));
    expect(offers).toHaveLength(2);
    expect(graveyard(game, A).filter((id) => game.state.objects[id].cardName === "Divination")).toHaveLength(1);
  });

  it("Invoke Calamity: a card exiled by the first spell's cost is no longer offered", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    spawn(game, "Rest in Peace", B);
    toHand(game, "Thrill of Possibility");
    const ritual = toHand(game, "Dark Ritual");
    a.chooseDiscardsFn = () => [ritual];
    const offers = casting(a, ["Thrill of Possibility"]);
    cast(game, toHand(game, "Invoke Calamity"));
    expect(zone(game, ritual)).toBe("exile");
    expect(offers.slice(1).flatMap(offeredNames)).not.toContain("Dark Ritual");
  });

  it("Sauron's Ransom: the opponent you choose makes the piles; one to hand, one to graveyard; the Ring tempts you", () => {
    const { game, a, b, c } = table({ players: 3 });
    const top = ["Hill Giant", "Grizzly Bears", "Hill Giant", "Grizzly Bears"].map((name) => toLibrary(game, name));
    game.state.zones.perPlayer[A].library = [...top, ...game.state.zones.perPlayer[A].library.filter((id) => !top.includes(id))];
    pickModes(a, 1);
    b.separatePilesFn = () => {
      throw new Error("Bob wasn't chosen");
    };
    c.separatePilesFn = () => [[top[0]], [top[1], top[2], top[3]]];
    a.choosePileFn = () => 1;
    lands(game, "Island", 2);
    lands(game, "Swamp", 1);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Sauron's Ransom"));
    expect(zone(game, top[0])).toBe("graveyard");
    expect([zone(game, top[1]), zone(game, top[2]), zone(game, top[3])]).toEqual(["hand", "hand", "hand"]);
    expect(hand(game, A).length).toBe(before + 3);
    expect(game.state.players[A].ringTemptations).toBe(1);
  });

  it("Biting-Palm Ninja: a menace counter it may spend to exile a nonland card from the player's hand", () => {
    const { game, a } = table();
    const ninja = enter(game, "Biting-Palm Ninja");
    expect(counters(game, ninja, "menace")).toBe(1);
    expect(keywords(game, ninja).has("menace")).toBe(true);
    const giant = toHand(game, "Hill Giant", B);
    pickModes(a, 0);
    const seen = pickFromZone(a, giant);
    attack(game, a, [ninja]);
    expect(life(game, B)).toBe(17);
    expect(counters(game, ninja, "menace")).toBe(0);
    expect(keywords(game, ninja).has("menace")).toBe(false);
    expect(seen.offered).toEqual([giant]);
    expect(zone(game, giant)).toBe("exile");
    // With no counter, nothing is asked.
    a.chooseModesFn = () => {
      throw new Error("no counter to remove");
    };
    attack(game, a, [ninja]);
    expect(life(game, B)).toBe(14);
  });

  it("Gwafa Hazid: a bribery counter, its controller draws, and only while a Gwafa is around it can't attack or block", () => {
    const t = table();
    const { game } = t;
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    const gwafa = spawn(game, "Gwafa Hazid, Profiteer");
    const bears = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    game.dispatch({ type: "activate-ability", player: A, source: gwafa, abilityIndex: 0, targets: [ref(bears)] });
    settle(game);
    expect(counters(game, bears, "bribery")).toBe(1);
    expect(hand(game, B).length).toBe(before + 1);
    const bound = restrictionsOf(game.state, registryOf(game), bears);
    expect(bound.has("cant-attack")).toBe(true);
    expect(bound.has("cant-block")).toBe(true);
    expect(cantBlock(t, other)).toBe(false);
    destroy(game, gwafa);
    expect(counters(game, bears, "bribery")).toBe(1);
    expect(cantBlock(t, bears)).toBe(false);
  });

  it("Rakdos's Return: the target opponent, or the targeted planeswalker's controller, discards X", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    lands(game, "Mountain", 4);
    const bobs = hand(game, B).length;
    cast(game, toHand(game, "Rakdos's Return"), { targets: [ref(B)], x: 2 });
    expect(life(game, B)).toBe(18);
    expect(hand(game, B).length).toBe(bobs - 2);
    const liliana = enter(game, "Liliana of the Veil", B);
    const after = hand(game, B).length;
    cast(game, toHand(game, "Rakdos's Return"), { targets: [ref(liliana)], x: 1 });
    expect(counters(game, liliana, "loyalty")).toBe(2);
    expect(life(game, B)).toBe(18);
    expect(hand(game, B).length).toBe(after - 1);
  });

  it("Cuombajj Witches: the named opponent picks the second target; you still control the ability", () => {
    const { game, b } = table({ players: 3 });
    const witches = spawn(game, "Cuombajj Witches");
    const mine = spawn(game, "Grizzly Bears");
    const bobs = spawn(game, "Hill Giant", B);
    grant(game, mine, "hexproof");
    grant(game, bobs, "hexproof");
    const offers = game.legalActions(A).filter((o) => o.kind === "activate-ability" && o.source === witches);
    expect(offers.map((o) => o.kind === "activate-ability" && o.otherChooser).sort()).toEqual([B, C]);
    const seen = watchTargets(b, () => [mine]);
    const giant = spawn(game, "Hill Giant", C);
    game.dispatch({ type: "activate-ability", player: A, source: witches, abilityIndex: 0, targets: [ref(giant)], otherChooser: B });
    settle(game);
    expect(seen.asked).toBe(1);
    // A hexproof creature of Alice's is hers to be targeted by her ability, even
    // on Bob's choice; Bob's isn't.
    expect(seen.offered[0]).toContain(mine);
    expect(seen.offered[0]).not.toContain(bobs);
    expect(game.state.objects[mine].damageMarked).toBe(1);
    expect(game.state.objects[giant].damageMarked).toBe(1);
  });

  it("Cuombajj Witches: both targets may be the same", () => {
    const { game, b } = table();
    const witches = spawn(game, "Cuombajj Witches");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(b, giant);
    game.dispatch({ type: "activate-ability", player: A, source: witches, abilityIndex: 0, targets: [ref(giant)], otherChooser: B });
    settle(game);
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });

  it("Incite Rebellion: each player and their creatures are dealt the number of creatures they control", () => {
    const { game } = table({ players: 3 });
    const mine = [spawn(game, "Grizzly Bears"), spawn(game, "Hill Giant")];
    const bobs = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Incite Rebellion"));
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([18, 19, 20]);
    expect(zone(game, mine[0])).toBe("graveyard");
    expect(game.state.objects[mine[1]].damageMarked).toBe(2);
    expect(game.state.objects[bobs].damageMarked).toBe(1);
  });

  it("Abattoir Ghoul: gains the toughness of a creature it damaged that dies, and only that", () => {
    const { game, a, b } = table();
    const ghoul = spawn(game, "Abattoir Ghoul");
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, bears);
    expect(life(game, A)).toBe(20);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: ghoul }];
    attack(game, a, [ghoul]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, ghoul)).toBe("battlefield");
    expect(life(game, A)).toBe(23);
  });

  it("Dinrova Horror: the permanent's owner gets it back and discards, who may discard that card", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    b.chooseDiscardsFn = () => [bears];
    const before = hand(game, B).length;
    enter(game, "Dinrova Horror");
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before);
  });

  it("Soul Search: a Spirit only for an exiled card of mana value 1 or less", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    lands(game, "Plains", 2);
    const giant = toHand(game, "Hill Giant", B);
    const seen = pickFromZone(a, giant);
    cast(game, toHand(game, "Soul Search"), { targets: [ref(B)] });
    expect(seen.offered).toEqual([giant]);
    expect(zone(game, giant)).toBe("exile");
    expect(tokensNamed(game, "Spirit Token (White-Black)", A)).toBe(0);
    const ritual = toHand(game, "Dark Ritual", B);
    pickFromZone(a, ritual);
    cast(game, toHand(game, "Soul Search"), { targets: [ref(B)] });
    expect(zone(game, ritual)).toBe("exile");
    expect(tokensNamed(game, "Spirit Token (White-Black)", A)).toBe(1);
  });

  it("Goblin Lyre: your creatures on a won flip, that player's on a lost one, a planeswalker's controller for one", () => {
    let won = 0;
    let lost = 0;
    for (let seed = 1; seed <= 16; seed++) {
      const { game } = table({ seed });
      spawn(game, "Grizzly Bears");
      spawn(game, "Grizzly Bears", B);
      spawn(game, "Grizzly Bears", B);
      spawn(game, "Grizzly Bears", B);
      const lyre = spawn(game, "Goblin Lyre");
      game.dispatch({ type: "activate-ability", player: A, source: lyre, abilityIndex: 0, targets: [ref(B)] });
      settle(game);
      expect(zone(game, lyre)).toBe("graveyard");
      if (life(game, B) === 19) {
        expect(life(game, A)).toBe(20);
        won += 1;
      } else {
        expect(life(game, A)).toBe(17);
        expect(life(game, B)).toBe(20);
        lost += 1;
      }
    }
    expect(won).toBeGreaterThan(0);
    expect(lost).toBeGreaterThan(0);
    let onWalker = 0;
    for (let seed = 1; seed <= 16; seed++) {
      const { game } = table({ seed });
      spawn(game, "Grizzly Bears", B);
      spawn(game, "Grizzly Bears", B);
      const liliana = enter(game, "Liliana of the Veil", B);
      const lyre = spawn(game, "Goblin Lyre");
      game.dispatch({ type: "activate-ability", player: A, source: lyre, abilityIndex: 0, targets: [ref(liliana)] });
      settle(game);
      if (life(game, A) === 18) onWalker += 1;
      else expect(life(game, A)).toBe(20);
    }
    expect(onWalker).toBeGreaterThan(0);
  });

  it("Frightful Delusion: that player discards whether or not they pay", () => {
    for (const pays of [false, true]) {
      const { game, a } = table();
      lands(game, "Island", 3);
      lands(game, "Island", 3, B);
      if (pays) lands(game, "Wastes", 1);
      const divination = toHand(game, "Divination");
      cast(game, divination, { settle: false });
      game.advanceUntil((s) => s.priority.holder === B);
      pickModes(a, 0);
      const before = hand(game, A).length;
      cast(game, toHand(game, "Frightful Delusion", B), { player: B, targets: [ref(divination)] });
      expect(zone(game, divination)).toBe("graveyard");
      // Paying lets Divination draw two; either way one card is discarded.
      expect(hand(game, A).length).toBe(before + (pays ? 2 : 0) - 1);
      expect(graveyard(game, A).length).toBe(2);
    }
  });

  for (const name of ["Goblin War Cry", "Eunuchs' Intrigues"]) {
    it(`${name}: the opponent's chosen creature may block, their others can't, a later arrival too`, () => {
      const t = table();
      const { game, b } = t;
      const bears = spawn(game, "Grizzly Bears", B);
      const giant = spawn(game, "Hill Giant", B);
      const mine = spawn(game, "Hill Giant");
      const seen = pickPermanents(b, bears);
      lands(game, "Mountain", 3);
      cast(game, toHand(game, name), { targets: [ref(B)] });
      expect(seen.offered).toEqual([bears, giant]);
      expect(cantBlock(t, bears)).toBe(false);
      expect(cantBlock(t, giant)).toBe(true);
      expect(cantBlock(t, mine)).toBe(false);
      const later = spawn(game, "Hill Giant", B);
      expect(cantBlock(t, later)).toBe(true);
      const offer = blockOffer(game, t.a, [mine]);
      expect(offer.eligible.map((e) => e.blocker)).toEqual([bears]);
    });
  }

  it("Goblin War Cry: one token of a stack is chosen, the others of it can't block", () => {
    const t = table();
    const { game, b } = t;
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 3 }, []);
    settle(game);
    const stack = named(game, "Soldier Token", B)[0];
    pickPermanents(b, stack);
    const mine = spawn(game, "Hill Giant");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Goblin War Cry"), { targets: [ref(B)] });
    const offer = blockOffer(game, t.a, [mine]);
    expect(offer.eligible.reduce((n, e) => n + (e.copies ?? 1), 0)).toBe(1);
  });
});
