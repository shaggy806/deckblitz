import { describe, expect, it } from "vitest";
import { validateCommanderDeck } from "../deck-validation.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  loyalty,
  toStep,
  attack,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  enter,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

// Mystery Booster Commander Edition's Rulebreaker commanders: the deckbuilding
// exceptions (`CardDefinition.rulebreaker`, read by `validateCommanderDeck`)
// and each card's ability in play.

const { game: shared } = table();
const reg = shared.registry;
const deck = (commander: string, cards: readonly string[], filler: string, size = 100) =>
  validateCommanderDeck(
    {
      commanders: [commander],
      cards: [...cards, ...Array<string>(size - 1 - cards.length).fill(filler)],
      size: 100,
    },
    reg,
  );

describe("Rulebreaker: deck validation", () => {
  it("Seluma lets in Angels and basic lands of any identity, nothing else", () => {
    expect(deck("Seluma, Light of Aysen", ["Angel of Despair", "Island"], "Plains").legal).toBe(true);
    const off = deck("Seluma, Light of Aysen", ["Counterspell"], "Plains");
    expect(off.legal).toBe(false);
    expect(off.violations.join()).toContain("Counterspell");
    // A nonbasic off-colour land isn't a basic land card.
    expect(deck("Seluma, Light of Aysen", ["Watery Grave"], "Plains").legal).toBe(false);
  });

  it("singleton still holds for a card a Rulebreaker lets in", () => {
    const r = deck("Seluma, Light of Aysen", ["Angel of Despair", "Angel of Despair"], "Plains");
    expect(r.legal).toBe(false);
    expect(r.violations.join()).toContain("singleton");
  });

  it("Maular: off-colour creatures of mana value 7 or more, but not 6", () => {
    expect(deck("Maular, the Next Evolution", ["Avacyn, Angel of Hope"], "Forest").legal).toBe(true);
    expect(deck("Maular, the Next Evolution", ["Serra Angel"], "Forest").legal).toBe(false);
  });

  it("Grizzlegom: any land cards, nonbasic ones too", () => {
    expect(deck("Grizzlegom, Hurloon Hero", ["Hallowed Fountain", "Island"], "Forest").legal).toBe(true);
    expect(deck("Grizzlegom, Hurloon Hero", ["Counterspell"], "Forest").legal).toBe(false);
  });

  it("The Everforger: artifact creatures and Equipment of any identity, not other artifacts", () => {
    expect(deck("The Everforger", ["Esper Sentinel", "Embercleave", "Swamp"], "Wastes").legal).toBe(true);
    expect(deck("The Everforger", ["Lightning Bolt"], "Wastes").legal).toBe(false);
  });

  it("Valko Indorian: Phyrexian cards of any identity", () => {
    expect(deck("Valko Indorian", ["Elesh Norn, Grand Cenobite"], "Swamp").legal).toBe(true);
    expect(deck("Valko Indorian", ["Serra Angel"], "Swamp").legal).toBe(false);
  });

  it("Tolabow: instants and sorceries may share one extra colour, the same one for all", () => {
    expect(deck("Tolabow, Loch Rascal", ["Lightning Bolt", "Fireball", "Mountain"], "Island").legal).toBe(true);
    const two = deck("Tolabow, Loch Rascal", ["Lightning Bolt", "Swords to Plowshares"], "Island");
    expect(two.legal).toBe(false);
    expect(two.violations.join()).toContain("one colour");
    // Only instants and sorceries: a red creature is still outside.
    expect(deck("Tolabow, Loch Rascal", ["Goblin Guide"], "Island").legal).toBe(false);
    // And only one colour per card: a two-colour-outside spell is out.
    expect(deck("Tolabow, Loch Rascal", ["Lightning Helix"], "Island").legal).toBe(false);
  });

  it("Whtz: a hundred is a minimum, not a maximum", () => {
    expect(deck("Whtz, the Bibliophile", [], "Island", 250).legal).toBe(true);
    const short = deck("Whtz, the Bibliophile", [], "Island", 99);
    expect(short.legal).toBe(false);
    expect(short.violations.join()).toContain("at least 100");
    // Without the Rulebreaker, more than a hundred is still too many.
    expect(deck("Atraxa, Praetors' Voice", [], "Island", 101).legal).toBe(false);
  });
});

describe("Rulebreaker commanders in play", () => {
  it("Whtz: {3} with a 40-card starting deck, free with 200 or more", () => {
    const { game } = table();
    expect(game.state.players[A].startingDeckSize).toBe(40);
    const whtz = spawn(game, "Whtz, the Bibliophile");
    expect(() => activate(game, whtz)).toThrow();
    game.state.players[A].startingDeckSize = 200;
    const before = hand(game).length;
    activate(game, whtz);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(21);
  });

  it("Grizzlegom: one thing for each basic land type", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 3);
    lands(game, "Forest", 1);
    const grizz = spawn(game, "Grizzlegom, Hurloon Hero");
    const cards = hand(game).length;
    attack(game, a, [grizz]);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
    expect(hand(game).length).toBe(cards + 1);
    expect(counters(game, grizz)).toBe(3);
    // 20 − 1 (Swamp) − 7 combat damage (4 + 3 counters).
    expect(life(game, B)).toBe(12);
    expect(life(game)).toBe(21);
  });

  it("Maular: a creature of mana value 7 or more attacking doubles; a smaller one doesn't", () => {
    const { game, a } = table();
    const maular = spawn(game, "Maular, the Next Evolution");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [maular, bears]);
    expect(pt(game, maular)).toEqual({ power: 20, toughness: 20 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Seluma: combat damage returns an Angel creature card from your graveyard", () => {
    const { game, a } = table();
    const seluma = spawn(game, "Seluma, Light of Aysen");
    const angel = toGraveyard(game, "Serra Angel");
    pickTargets(a, angel);
    attack(game, a, [seluma]);
    expect(zone(game, angel as ObjectId)).toBe("battlefield");
    expect(graveyard(game)).not.toContain(angel);
  });

  it("Valko Indorian: Phyrexian creatures you control have menace and lifelink", () => {
    const { game } = table();
    spawn(game, "Valko Indorian");
    const phyrexian = spawn(game, "Elesh Norn, Grand Cenobite");
    const human = spawn(game, "Grizzly Bears");
    expect(keywords(game, phyrexian).has("menace")).toBe(true);
    expect(keywords(game, phyrexian).has("lifelink")).toBe(true);
    expect(keywords(game, human).has("menace")).toBe(false);
  });

  it("Tolabow: an instant makes a prowess Otter", () => {
    const { game } = table();
    spawn(game, "Tolabow, Loch Rascal");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Otter Token", A)).toBe(1);
  });

  it("The Everforger: copies the first artifact creature spell each turn, only that one", () => {
    const { game, a } = table();
    spawn(game, "The Everforger");
    pickModes(a, 0);
    cast(game, toHand(game, "Ornithopter"));
    cast(game, toHand(game, "Ornithopter"));
    const thopters = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Ornithopter");
    expect(thopters.length).toBe(3);
  });
});

describe("Tresserhorn's Lord, Returned", () => {
  it("kept by sacrificing three creatures, paying 3 life and the opponent drawing three", () => {
    const { game, a } = table();
    const fodder = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Ornithopter")];
    const mine = hand(game).length;
    const theirs = hand(game, B).length;
    pickTargets(a, B);
    pickModes(a, 0);
    pickPermanents(a, ...fodder);
    const lord = enter(game, "Tresserhorn's Lord, Returned");
    expect(zone(game, lord)).toBe("battlefield");
    expect(fodder.every((id) => zone(game, id) === "graveyard")).toBe(true);
    expect(life(game)).toBe(17);
    expect(hand(game, B).length).toBe(theirs + 3);
    // Each creature sacrificed draws a card.
    expect(hand(game).length).toBe(mine + 3);
  });

  it("sacrificed when one part can't be done: one Bear and him aren't three", () => {
    const { game, a } = table();
    const fodder = [spawn(game, "Grizzly Bears")];
    const theirs = hand(game, B).length;
    pickTargets(a, B);
    pickModes(a, 0);
    const lord = enter(game, "Tresserhorn's Lord, Returned");
    expect(zone(game, lord)).toBe("graveyard");
    expect(fodder.every((id) => zone(game, id) === "battlefield")).toBe(true);
    expect(life(game)).toBe(20);
    expect(hand(game, B).length).toBe(theirs);
  });

  it("sacrificed when life can't pay 3, however many creatures", () => {
    const { game, a } = table({ life: 2 });
    for (let i = 0; i < 3; i += 1) spawn(game, "Grizzly Bears");
    pickTargets(a, B);
    pickModes(a, 0);
    const lord = enter(game, "Tresserhorn's Lord, Returned");
    expect(zone(game, lord)).toBe("graveyard");
    expect(life(game)).toBe(2);
  });

  it("declining sacrifices him", () => {
    const { game, a } = table();
    for (let i = 0; i < 3; i += 1) spawn(game, "Grizzly Bears");
    pickTargets(a, B);
    pickModes(a);
    const lord = enter(game, "Tresserhorn's Lord, Returned");
    expect(zone(game, lord)).toBe("graveyard");
    expect(life(game)).toBe(20);
  });
});

describe("Selenia, the Cursed Heart", () => {
  it("doubles your life gain", () => {
    const { game } = table();
    spawn(game, "Selenia, the Cursed Heart");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    settle(game);
    expect(life(game)).toBe(26);
  });

  it("dying, it curses the target opponent, whose life loss is then doubled", () => {
    const { game, a } = table();
    const selenia = spawn(game, "Selenia, the Cursed Heart");
    pickTargets(a, B);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(selenia)]);
    settle(game);
    const curse = game.state.zones.shared.battlefield.find(
      (id) => game.state.objects[id].cardName === "Selenia's Curse Token",
    );
    expect(curse).toBeDefined();
    expect(game.state.objects[curse!].attachedToPlayer).toBe(B);
    expect(game.state.objects[curse!].controller).toBe(A);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 2, who: "each-opponent" }, []);
    settle(game);
    expect(life(game, B)).toBe(16);
    // Only the enchanted player's.
    game.debugApplyEffect(B, { kind: "lose-life", amount: 2, who: "each-opponent" }, []);
    settle(game);
    expect(life(game)).toBe(18);
  });
});

describe("Flitwing, Lyev Detective", () => {
  it("creating tokens, you may make that many Clues instead", () => {
    const { game, a } = table();
    spawn(game, "Flitwing, Lyev Detective");
    pickModes(a, 1); // the replacement's yes
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 3 }, []);
    settle(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(3);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(0);
  });

  it("declining keeps the tokens, and an opponent's tokens aren't replaced", () => {
    const { game, a } = table();
    spawn(game, "Flitwing, Lyev Detective");
    pickModes(a, 0); // no
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 2 }, []);
    settle(game);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Soldier Token", B)).toBe(1);
  });
});

describe("Venser, Visionary Traveler", () => {
  it("a creature cast from your hand enters with no counters", () => {
    const { game } = table();
    spawn(game, "Venser, Visionary Traveler");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(0);
  });

  it("a creature put onto the battlefield, never cast, enters with two", () => {
    const { game } = table();
    spawn(game, "Venser, Visionary Traveler");
    const bears = toGraveyard(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0 }, [ref(bears)]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(2);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("a token doesn't get them, and an opponent's creature doesn't either", () => {
    const { game } = table();
    spawn(game, "Venser, Visionary Traveler");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    const soldier = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Soldier Token");
    expect(counters(game, soldier!)).toBe(0);
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "put-onto-battlefield", target: 0 }, [ref(theirs)]);
    expect(counters(game, theirs)).toBe(0);
  });

  it("+1 flickers your creature, which comes back at the end step with two counters", () => {
    const { game } = table();
    const venser = spawn(game, "Venser, Visionary Traveler");
    const bears = spawn(game, "Grizzly Bears");
    loyalty(game, venser, 1, { targets: [ref(bears)] });
    expect(zone(game, bears as ObjectId)).not.toBe("battlefield");
    toStep(game, "cleanup");
    const back = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(back).toBeDefined();
    expect(counters(game, back!)).toBe(2);
  });

  it("−2 returns up to one nonland permanent of each opponent", () => {
    const { game } = table({ players: 3 });
    const venser = spawn(game, "Venser, Visionary Traveler");
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Ornithopter", C);
    loyalty(game, venser, -2, { targets: [ref(bobs), ref(carols), null] });
    expect(zone(game, bobs)).toBe("hand");
    expect(zone(game, carols)).toBe("hand");
  });
});
