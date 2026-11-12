import { describe, expect, it } from "vitest";
import { validateCommanderDeck } from "../deck-validation.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
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
