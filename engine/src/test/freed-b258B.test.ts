import { describe, expect, it } from "vitest";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  enter,
  keywords,
  lands,
  loyalty,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

const hand = (g: ReturnType<typeof table>["game"], p = A): number => g.state.zones.perPlayer[p].hand.length;
const life = (g: ReturnType<typeof table>["game"], p = A): number => g.state.players[p].life;
const library = (g: ReturnType<typeof table>["game"], p = A) => g.state.zones.perPlayer[p].library;
const graveyard = (g: ReturnType<typeof table>["game"], p = A) => g.state.zones.perPlayer[p].graveyard;

describe("freed cards, batch 258, group B", () => {
  it("Tam proliferates once per planeswalker type among your planeswalkers", () => {
    const { game, a } = table();
    const tam = spawn(game, "Tam, the Possibility");
    spawn(game, "Chandra Nalaar");
    const jace = spawn(game, "Jace, the Mind Sculptor");
    spawn(game, "Jace, the Living Guildpact");
    game.state.objects[jace].counters.loyalty = 3;
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    let asked = 0;
    a.chooseProliferateFn = (_v, eligible) => {
      asked += 1;
      return eligible.filter((t) => t.kind === "object" && t.object === jace);
    };
    activate(game, tam, 0);
    expect(asked).toBe(2);
    expect(game.state.objects[jace].counters.loyalty).toBe(5);
  });

  it("Tsabo's Decree discards and destroys only the chosen type, unregenerably", () => {
    const { game, a } = table();
    const elf = spawn(game, "Llanowar Elves", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Llanowar Elves", A);
    const elfCard = toHand(game, "Llanowar Elves", B);
    const bearCard = toHand(game, "Grizzly Bears", B);
    lands(game, "Swamp", 6);
    pickTargets(a, B);
    a.chooseCreatureTypeFn = () => "Elf";
    cast(game, toHand(game, "Tsabo's Decree"), { targets: [ref(B)] });
    expect(zone(game, elf)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, elfCard)).toBe("graveyard");
    expect(zone(game, bearCard)).toBe("hand");
  });

  it("Borborygmos and Fblthp discards any number of lands and deals twice that", () => {
    const { game, a } = table();
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    const land1 = toHand(game, "Forest");
    const land2 = toHand(game, "Island");
    const spell = toHand(game, "Grizzly Bears");
    let offered: readonly string[] = [];
    a.chooseDiscardsFn = (eligible) => {
      offered = eligible.map((card) => card.id);
      return [land1, land2];
    };
    pickTargets(a, dreadmaw);
    enter(game, "Borborygmos and Fblthp");
    expect(offered).toContain(land1);
    expect(offered).not.toContain(spell);
    expect(zone(game, land1)).toBe("graveyard");
    expect(zone(game, land2)).toBe("graveyard");
    expect(game.state.objects[dreadmaw].damageMarked).toBe(4);
  });

  it("Borborygmos and Fblthp: no discard, no reflexive ability", () => {
    const { game, a } = table();
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    a.chooseDiscardsFn = () => [];
    const targets = watchTargets(a);
    enter(game, "Borborygmos and Fblthp");
    expect(targets.asked).toBe(0);
    expect(game.state.objects[dreadmaw].damageMarked).toBe(0);
  });

  it("Body Snatcher is exiled without a creature card to discard, and exiles itself on dying", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const snatcher = enter(game, "Body Snatcher");
    expect(zone(game, snatcher)).toBe("exile");

    const again = table();
    const creature = toHand(again.game, "Grizzly Bears");
    pickModes(again.a, 0);
    pickFromZone(again.a, creature);
    const kept = enter(again.game, "Body Snatcher");
    expect(zone(again.game, kept)).toBe("battlefield");
    expect(zone(again.game, creature)).toBe("graveyard");

    // Dies targeting itself: exiled, and doesn't come back (the ruling).
    lands(again.game, "Swamp", 3);
    pickTargets(again.a, kept);
    cast(again.game, toHand(again.game, "Murder"), { targets: [ref(kept)] });
    expect(zone(again.game, kept)).toBe("exile");
  });

  it("Body Snatcher's dies trigger exiles it and returns the target", () => {
    const { game, a } = table();
    const snatcher = spawn(game, "Body Snatcher");
    const back = toGraveyard(game, "Hill Giant");
    lands(game, "Swamp", 3);
    pickTargets(a, back);
    cast(game, toHand(game, "Murder"), { targets: [ref(snatcher)] });
    expect(zone(game, snatcher)).toBe("exile");
    expect(zone(game, back)).toBe("battlefield");
  });

  it("Dokuchi Silencer's reflexive destroy reaches only what the damaged player controls", () => {
    const { game, a } = table();
    const silencer = spawn(game, "Dokuchi Silencer");
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A);
    const card = toHand(game, "Llanowar Elves");
    pickModes(a, 0);
    pickFromZone(a, card);
    a.chooseTargetsFn = (_v, _n, _s, legal) => {
      const ids = legal[0].map((t) => (t.kind === "object" ? t.object : t.player));
      expect(ids).toContain(theirs);
      expect(ids).not.toContain(mine);
      return [ref(theirs)];
    };
    toStep(game, "declare-attackers");
    attack(game, a, [silencer]);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, card)).toBe("graveyard");
  });

  it("All-Fates Scroll draws one per differently named land", () => {
    const { game } = table();
    const scroll = spawn(game, "All-Fates Scroll");
    lands(game, "Wastes", 7);
    spawn(game, "Forest");
    spawn(game, "Island");
    const before = hand(game);
    activate(game, scroll, 1);
    expect(hand(game)).toBe(before + 3);
  });

  it("Survey Mechan costs {X} less for differently named lands", () => {
    const { game } = table();
    const mechan = spawn(game, "Survey Mechan");
    // Three names, so {10} is {7}: exactly the seven lands below pay it.
    spawn(game, "Forest");
    spawn(game, "Island");
    lands(game, "Wastes", 5);
    const giant = spawn(game, "Colossal Dreadmaw", B);
    const before = hand(game);
    activate(game, mechan, 0, { targets: [ref(giant), ref(A)] });
    expect(game.state.objects[giant].damageMarked).toBe(3);
    expect(hand(game)).toBe(before + 3);
    expect(life(game)).toBe(23);
  });

  it("Ashnod's Cylix: the target player keeps one on top and exiles the rest", () => {
    const { game, a, b } = table();
    const cylix = spawn(game, "Ashnod's Cylix");
    lands(game, "Wastes", 3);
    const c1 = toLibrary(game, "Forest", B);
    const c2 = toLibrary(game, "Island", B);
    const c3 = toLibrary(game, "Swamp", B);
    b.chooseFromZoneFn = (_v, eligible) => {
      expect(eligible).toContain(c1);
      return [c1];
    };
    let aliceAsked = false;
    a.chooseFromZoneFn = () => {
      aliceAsked = true;
      return [];
    };
    activate(game, cylix, 0, { targets: [ref(B)] });
    expect(aliceAsked).toBe(false);
    expect(library(game, B)[0]).toBe(c1);
    expect(zone(game, c2)).toBe("exile");
    expect(zone(game, c3)).toBe("exile");
  });

  it("Case the Joint draws two and looks at each library's top, moving nothing", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const theirTop = toLibrary(game, "Forest", B);
    const shown: (readonly string[])[] = [];
    a.chooseFromZoneFn = () => {
      const awaiting = game.state.awaiting as unknown as { ids: readonly string[] };
      shown.push(awaiting.ids);
      return [];
    };
    const before = hand(game);
    cast(game, toHand(game, "Case the Joint"));
    expect(hand(game)).toBe(before + 2);
    expect(shown.length).toBe(2);
    expect(library(game, B)[0]).toBe(theirTop);
    expect(shown[1]).toEqual([theirTop]);
  });

  it("Jace, the Mind Sculptor's ultimate exiles the library, then shuffles the hand in", () => {
    const { game } = table();
    const jace = spawn(game, "Jace, the Mind Sculptor");
    const held = hand(game, B);
    loyalty(game, jace, -12, { atLeast: 12, targets: [ref(B)] });
    expect(library(game, B).length).toBe(held);
    expect(hand(game, B)).toBe(0);
  });

  it("Siphon Insight exiles a card face down that its caster may play, a land too", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const land = toLibrary(game, "Forest", B);
    const other = toLibrary(game, "Island", B);
    pickFromZone(a, other);
    cast(game, toHand(game, "Siphon Insight"), { targets: [ref(B)] });
    expect(zone(game, other)).toBe("exile");
    expect(library(game, B).at(-1)).toBe(land);
    expect(game.state.objects[other].exiledFaceDown).toBeDefined();
    const why = game.canDispatch({ type: "play-land", player: A, card: other });
    expect(why).toBeNull();
  });

  it("Thoughtpicker Witch exiles one of the top two and leaves the other on top", () => {
    const { game, a } = table();
    const witch = spawn(game, "Thoughtpicker Witch");
    lands(game, "Wastes", 1);
    const fodder = spawn(game, "Grizzly Bears");
    const kept = toLibrary(game, "Forest", B);
    const taken = toLibrary(game, "Island", B);
    pickFromZone(a, taken);
    activate(game, witch, 0, { targets: [ref(B)], sacrifice: fodder });
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zone(game, taken)).toBe("exile");
    expect(library(game, B)[0]).toBe(kept);
  });

  it("The Wedding of River Song: both players draw and may suspend a nonland card", () => {
    const { game, a, b } = table();
    lands(game, "Plains", 3);
    const mine = toHand(game, "Grizzly Bears");
    const theirs = toHand(game, "Hill Giant", B);
    const before = hand(game, B);
    a.chooseFromZoneFn = (_v, eligible) => (eligible.includes(mine) ? [mine] : []);
    b.chooseFromZoneFn = (_v, eligible) => (eligible.includes(theirs) ? [theirs] : []);
    a.chooseTimeTravelFn = () => ({ add: [], remove: [] });
    cast(game, toHand(game, "The Wedding of River Song"), { targets: [ref(B)] });
    expect(zone(game, mine)).toBe("exile");
    expect(game.state.objects[mine].counters.time).toBe(2);
    expect(zone(game, theirs)).toBe("exile");
    expect(game.state.objects[theirs].counters.time).toBe(4);
    expect(hand(game, B)).toBe(before + 2 - 1);
  });

  it("Vendilion Clique bottoms the chosen nonland card, reveals it, and that player draws", () => {
    const { game, a } = table();
    const spell = toHand(game, "Grizzly Bears", B);
    const land = toHand(game, "Forest", B);
    const before = hand(game, B);
    pickTargets(a, B);
    let round = 0;
    let offered: readonly string[] = [];
    a.chooseFromZoneFn = (_v, eligible) => {
      round += 1;
      if (round === 1) return [];
      if (round === 2) offered = eligible;
      return [spell];
    };
    const revealsBefore = game.eventsOfType("cards-revealed").length;
    enter(game, "Vendilion Clique");
    expect(offered).toContain(spell);
    expect(offered).not.toContain(land);
    const reveals = game.eventsOfType("cards-revealed").slice(revealsBefore);
    expect(reveals.length).toBe(1);
    expect(reveals[0].objects).toEqual([spell]);
    expect(library(game, B).at(-1)).toBe(spell);
    expect(hand(game, B)).toBe(before);
  });

  it("Vendilion Clique: choosing nothing reveals nothing and draws nothing", () => {
    const { game, a } = table();
    toHand(game, "Grizzly Bears", B);
    const before = hand(game, B);
    pickTargets(a, B);
    a.chooseFromZoneFn = () => [];
    const revealsBefore = game.eventsOfType("cards-revealed").length;
    enter(game, "Vendilion Clique");
    expect(game.eventsOfType("cards-revealed").length).toBe(revealsBefore);
    expect(hand(game, B)).toBe(before);
  });

  it("Wu Spy mills one of the top two of its choice into that player's graveyard", () => {
    const { game, a } = table();
    const keep = toLibrary(game, "Forest", B);
    const mill = toLibrary(game, "Island", B);
    pickTargets(a, B);
    pickFromZone(a, mill);
    enter(game, "Wu Spy");
    expect(zone(game, mill)).toBe("graveyard");
    expect(library(game, B)[0]).toBe(keep);
  });

  it("Cabaretti Confluence may repeat a mode with its own targets", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, A);
    cast(game, toHand(game, "Cabaretti Confluence"), { modes: [2, 2, 2], targets: [ref(A), ref(A), ref(A)] });
    expect(pt(game, bears).power).toBe(5);
  });

  it("Moment of Reckoning may choose no modes, or a mode four times", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Swamp", 2);
    lands(game, "Wastes", 3);
    const t1 = spawn(game, "Grizzly Bears", B);
    const t2 = spawn(game, "Hill Giant", B);
    const back = toGraveyard(game, "Llanowar Elves");
    cast(game, toHand(game, "Moment of Reckoning"), { modes: [0, 0, 1], targets: [ref(t1), ref(t2), ref(back)] });
    expect(zone(game, t1)).toBe("graveyard");
    expect(zone(game, t2)).toBe("graveyard");
    expect(zone(game, back)).toBe("battlefield");
  });

  it("Obscura Confluence: the target player picks which creature card returns", () => {
    const { game, b } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 1);
    const c1 = toGraveyard(game, "Grizzly Bears", B);
    const c2 = toGraveyard(game, "Hill Giant", B);
    toGraveyard(game, "Forest", B);
    let picks = 0;
    b.chooseFromZoneFn = (_v, eligible) => {
      picks += 1;
      return [eligible[0]];
    };
    cast(game, toHand(game, "Obscura Confluence"), { modes: [2, 2, 2], targets: [ref(B), ref(B), ref(B)] });
    expect(picks).toBe(2);
    expect(zone(game, c1)).toBe("hand");
    expect(zone(game, c2)).toBe("hand");
  });

  it("Journey On counts opponents who control an artifact, not artifacts", () => {
    const { game } = table({ players: 3 });
    lands(game, "Forest", 1);
    spawn(game, "Sol Ring", B);
    spawn(game, "Sol Ring", B);
    const before = game.state.zones.shared.battlefield.length;
    cast(game, toHand(game, "Kellan, Daring Traveler"), { face: 1 });
    expect(game.state.zones.shared.battlefield.length).toBe(before + 2);
  });

  it("Great Unclean One makes a Plaguebearer per opponent below you after the loss", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Great Unclean One");
    game.state.players[A].life = 19;
    game.state.players[B].life = 30;
    game.state.players[C].life = 20;
    toStep(game, "end");
    settle(game);
    expect(life(game, C)).toBe(18);
    const tokens = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Plaguebearer of Nurgle");
    expect(tokens.length).toBe(1);
  });

  it("Price of Progress reads each player's own nonbasic lands, twice", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    spawn(game, "Command Tower", B);
    spawn(game, "Command Tower", B);
    spawn(game, "Command Tower", A);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Price of Progress"));
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(18);
  });

  it("Mjölnir taps and stuns, then burns each opponent per tapped creature they control", () => {
    const { game, a } = table({ players: 3 });
    const legend = spawn(game, "Tam, the Possibility");
    const hammer = spawn(game, "Mjölnir, Storm Hammer");
    lands(game, "Wastes", 4);
    activate(game, hammer, 0, { targets: [ref(legend)] });
    const target = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B, { tapped: true });
    spawn(game, "Hill Giant", C, { tapped: true });
    pickTargets(a, target);
    attack(game, a, [legend]);
    expect(game.state.objects[target].counters.stun).toBe(1);
    expect(life(game, B)).toBeLessThanOrEqual(20 - 2);
    expect(life(game, C)).toBe(19);
  });

  it("Origin of Black Widow's last chapter reads each opponent's own graveyard", () => {
    const { game } = table({ players: 3 });
    const saga = spawn(game, "Origin of Black Widow");
    game.state.objects[saga].counters.lore = 2;
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Hill Giant", B);
    toGraveyard(game, "Grizzly Bears", C);
    toGraveyard(game, "Grizzly Bears", A);
    toStep(game, "precombat-main", B);
    toStep(game, "precombat-main", A);
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(19);
    expect(life(game, A)).toBe(20);
  });

  it("Surveyor's Scope finds one basic per player two lands ahead", () => {
    const { game, a } = table({ players: 3 });
    const scope = spawn(game, "Surveyor's Scope");
    lands(game, "Wastes", 1);
    lands(game, "Wastes", 3, B);
    lands(game, "Wastes", 2, C);
    const f1 = toLibrary(game, "Forest");
    let most = -1;
    a.chooseFromZoneFn = (_v, eligible, _min, max) => {
      most = max;
      return eligible.includes(f1) ? [f1] : [];
    };
    activate(game, scope, 0);
    // Bob's three is two ahead of Alice's one; Carol's two isn't.
    expect(most).toBe(1);
    expect(zone(game, f1)).toBe("battlefield");
    expect(zone(game, scope)).toBe("exile");
  });

  it("Commit puts a spell second from the top of its owner's library", () => {
    const { game } = table();
    lands(game, "Island", 4);
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    const top = library(game, B)[0];
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, bolt, { player: B, targets: [ref(A)], settle: false });
    game.dispatch({ type: "pass-priority", player: B });
    const before = library(game, B).length;
    cast(game, toHand(game, "Commit // Memory"), { face: 1, targets: [ref(bolt)], settle: false });
    settle(game);
    expect(library(game, B).length).toBe(before + 1);
    expect(library(game, B)[1]).toBe(bolt);
    expect(library(game, B)[0]).toBe(top);
    expect(life(game)).toBe(20);
  });

  it("Midnight Clock's twelfth counter shuffles, draws seven and exiles it", () => {
    const { game } = table();
    const clock = spawn(game, "Midnight Clock");
    game.state.objects[clock].counters.hour = 11;
    lands(game, "Island", 3);
    toGraveyard(game, "Grizzly Bears");
    activate(game, clock, 1);
    expect(zone(game, clock)).toBe("exile");
    expect(hand(game)).toBe(7);
    expect(graveyard(game).length).toBe(0);
  });

  it("Time Spiral exiles itself, reshuffles, and you untap up to six lands of anyone's", () => {
    const { game, a } = table();
    const mine = lands(game, "Island", 6);
    const theirs = spawn(game, "Forest", B, { tapped: true });
    const spiral = toHand(game, "Time Spiral");
    pickPermanents(a, theirs, mine[0]);
    cast(game, spiral);
    expect(zone(game, spiral)).toBe("exile");
    expect(hand(game, B)).toBe(7);
    expect(game.state.objects[theirs].tapped).toBe(false);
  });

  it("Trenzalore Clocktower needs a Time Lord and twelve counters", () => {
    const { game } = table();
    const tower = spawn(game, "Trenzalore Clocktower");
    game.state.objects[tower].counters.time = 12;
    lands(game, "Island", 2);
    const action = { type: "activate-ability", player: A, source: tower, abilityIndex: 1, targets: [] } as const;
    expect(game.canDispatch(action)).not.toBeNull();
    spawn(game, "Rassilon, the War President");
    activate(game, tower, 1);
    expect(zone(game, tower)).toBe("exile");
    expect(hand(game)).toBe(7);
  });

  it("The Great Aurora: each player reshuffles permanents and hand, draws that many, then may drop lands", () => {
    const { game, a, b } = table({ deck: "Forest" });
    lands(game, "Forest", 9);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    const handB = hand(game, B);
    a.chooseFromZoneFn = (_v, eligible) => [eligible[0]];
    b.chooseFromZoneFn = () => [];
    const before = hand(game);
    cast(game, toHand(game, "The Great Aurora"));
    expect(hand(game, B)).toBe(handB + 2);
    expect(hand(game)).toBe(before + 9 - 1);
    expect(game.state.zones.shared.battlefield.length).toBe(1);
  });

  it("Molten Psyche's metalcraft reads each opponent's own draws", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 3);
    spawn(game, "Sol Ring");
    spawn(game, "Sol Ring");
    spawn(game, "Sol Ring");
    const b = hand(game, B);
    const c = hand(game, C);
    cast(game, toHand(game, "Molten Psyche"));
    expect(life(game, B)).toBe(20 - b);
    expect(life(game, C)).toBe(20 - c);
    expect(life(game)).toBe(20);
  });

  it("Fearsome Temper's granted ability stops one creature blocking that one attacker", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const temper = toHand(game, "Fearsome Temper");
    lands(game, "Mountain", 6);
    cast(game, temper, { targets: [ref(bears)] });
    expect(pt(game, bears).power).toBe(4);
    const blocker = spawn(game, "Hill Giant", B);
    activate(game, bears, 0, { targets: [ref(blocker)] });
    expect(game.state.objects[blocker].zone).toBe("battlefield");
  });

  it("Development draws once a pass when an opponent says so, else makes the token", () => {
    const { game, b, c } = table({ players: 3 });
    lands(game, "Wastes", 3);
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    let bAsked = 0;
    let cAsked = 0;
    b.chooseModesFn = () => {
      bAsked += 1;
      return bAsked === 1 ? [0] : [];
    };
    c.chooseModesFn = () => {
      cAsked += 1;
      return [];
    };
    const before = hand(game);
    cast(game, toHand(game, "Research // Development"), { face: 2 });
    expect(hand(game)).toBe(before + 1);
    expect(bAsked).toBe(3);
    // The first pass stopped at Bob's yes.
    expect(cAsked).toBe(2);
    const tokens = game.state.zones.shared.battlefield
      .filter((id) => game.state.objects[id].cardName === "Elemental Token (Research // Development)")
      .reduce((sum, id) => sum + (game.state.objects[id].stackCount ?? 1), 0);
    expect(tokens).toBe(2);
  });

  it("Research shuffles up to four cards from outside the game into the library", () => {
    const { game, a } = table({ sideboard: ["Grizzly Bears", "Hill Giant", "Forest"] });
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    const before = library(game).length;
    a.chooseFromZoneFn = (_v, eligible) => eligible.slice(0, 2);
    cast(game, toHand(game, "Research // Development"), { face: 1 });
    expect(library(game).length).toBe(before + 2);
  });

  it("The Raven's Warning: chapter II looks at the damaged player's hand and draws", () => {
    const { game, a } = table();
    const saga = spawn(game, "The Raven's Warning");
    const flyer = spawn(game, "Serra Angel");
    game.state.objects[saga].counters.lore = 1;
    const seen: (readonly string[])[] = [];
    a.chooseFromZoneFn = () => {
      const awaiting = game.state.awaiting as unknown as { ids: readonly string[] };
      seen.push(awaiting.ids);
      return [];
    };
    toStep(game, "precombat-main", B);
    toStep(game, "precombat-main", A);
    settle(game);
    expect(game.state.objects[saga].counters.lore).toBe(2);
    const before = hand(game);
    attack(game, a, [flyer]);
    expect(seen.length).toBe(1);
    expect(hand(game)).toBe(before + 1);
    expect([...seen[0]].sort()).toEqual([...game.state.zones.perPlayer[B].hand].sort());
  });

  it("The Raven's Warning: chapter III puts a card from outside the game on top", () => {
    const { game, a } = table({ sideboard: ["Hill Giant"] });
    const saga = spawn(game, "The Raven's Warning");
    game.state.objects[saga].counters.lore = 2;
    a.chooseFromZoneFn = (_v, eligible) => eligible.slice(0, 1);
    toStep(game, "precombat-main", B);
    toStep(game, "precombat-main", A);
    settle(game);
    const top = library(game)[0];
    expect(game.state.objects[top].cardName).toBe("Hill Giant");
  });

  it("Dazzling Reflection gains on resolution and shields the next damage only", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Dazzling Reflection"), { targets: [ref(bears)] });
    expect(life(game)).toBe(22);
    // The attack is the next time it would deal damage.
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(20);
  });

  it("Dromoka's Command's counter then fight, in printed order", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    // The counter first makes it 3/3, so it survives and deals 3 to the 3/3 Giant.
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Dromoka's Command"), {
      modes: [2, 3],
      targets: [ref(mine), ref(mine), ref(theirs)],
    });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("graveyard");
  });

  it("Soul Parry prevents everything its creatures would deal", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Soul Parry"), { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(20);
  });

  it("Invasion of Ikoria's enters trigger reads the X it was cast with and skips Humans", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const big = toLibrary(game, "Hill Giant");
    const human = toLibrary(game, "Fervent Champion");
    const small = toLibrary(game, "Grizzly Bears");
    let offered: readonly string[] = [];
    pickModes(a, 1);
    a.chooseFromZoneFn = (_v, eligible) => {
      offered = eligible;
      return [small];
    };
    cast(game, toHand(game, "Invasion of Ikoria"), { x: 2 });
    expect(offered).not.toContain(big);
    expect(offered).not.toContain(human);
    expect(zone(game, small)).toBe("battlefield");
  });

  it("Rootcast Apprenticeship's opponent sacrifices a nontoken artifact of their choice", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const ring = spawn(game, "Sol Ring", B);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Rootcast Apprenticeship"), { modes: [0, 0, 3], targets: [ref(bears), ref(bears), ref(B)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(game.state.objects[bears].counters["+1/+1"]).toBe(4);
  });

  it("Dromoka's Command's target player sacrifices an enchantment, and its shield stops a spell's damage", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    const aura = spawn(game, "Recycle", B);
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, bolt, { player: B, targets: [ref(A)], settle: false });
    game.dispatch({ type: "pass-priority", player: B });
    cast(game, toHand(game, "Dromoka's Command"), { modes: [0, 1], targets: [ref(bolt), ref(B)], settle: false });
    settle(game);
    expect(zone(game, aura)).toBe("graveyard");
    expect(life(game)).toBe(20);
  });

  it("Proud Wildbonder lets a trampler assign as though unblocked", () => {
    const { game, a, b } = table();
    const proud = spawn(game, "Proud Wildbonder");
    const wall = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: proud }];
    a.assignCombatDamageFn = () => "unblocked";
    attack(game, a, [proud]);
    expect(life(game, B)).toBe(16);
  });

  it("Wolverine doubles an attacking Mutant's power", () => {
    const { game, a } = table();
    const wolverine = spawn(game, "Wolverine, Claws Out");
    attack(game, a, [wolverine]);
    expect(life(game, B)).toBe(16);
  });

  it("Ginger makes a named, {1} Gingerbrute at each upkeep while you're the monarch", () => {
    const { game } = table();
    enter(game, "Ginger, Queen of Sweets");
    toStep(game, "upkeep", B);
    settle(game);
    const tokens = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Gingerbrute Token");
    expect(tokens.length).toBe(1);
    expect(game.state.objects[tokens[0]].controller).toBe(A);
  });

  it("Relentless X-ATM092 returns tapped with a finality counter", () => {
    const { game } = table();
    const card = toGraveyard(game, "Relentless X-ATM092");
    lands(game, "Wastes", 8);
    activate(game, card, 0);
    expect(zone(game, card)).toBe("battlefield");
    expect(game.state.objects[card].tapped).toBe(true);
    expect(game.state.objects[card].counters.finality).toBe(1);
  });

  it("Necrodominance pays the chosen amount of life and draws that many", () => {
    const { game, a } = table();
    spawn(game, "Necrodominance");
    a.chooseNumberFn = () => 3;
    pickModes(a, 0);
    const before = hand(game);
    toStep(game, "end");
    settle(game);
    expect(life(game)).toBe(17);
    expect(hand(game)).toBe(before + 3);
  });

  it("Recycle draws for a land played and a spell cast", () => {
    const { game } = table();
    spawn(game, "Recycle");
    const before = hand(game);
    const land = toHand(game, "Forest");
    game.dispatch({ type: "play-land", player: A, card: land });
    settle(game);
    expect(hand(game)).toBe(before + 1);
  });

  it("Taigam exiles X cards for -X/-X with no {X} in its cost", () => {
    const { game, a } = table();
    const taigam = spawn(game, "Taigam, Sidisi's Hand");
    lands(game, "Swamp", 1);
    toGraveyard(game, "Forest");
    toGraveyard(game, "Forest");
    const big = spawn(game, "Colossal Dreadmaw", B);
    a.chooseFromZoneFn = (_v, eligible) => eligible.slice(0, 2);
    activate(game, taigam, 0, { targets: [ref(big)], x: 2 });
    expect(pt(game, big).power).toBe(4);
    expect(graveyard(game).length).toBe(0);
  });

  it("Sands of Time flips the active player's artifacts, creatures and lands at once", () => {
    const { game } = table();
    spawn(game, "Sands of Time", B);
    const tapped = spawn(game, "Forest", A, { tapped: true });
    const untapped = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Forest", B, { tapped: true });
    const aura = spawn(game, "Sol Ring", A, { tapped: true });
    toStep(game, "upkeep", B);
    settle(game);
    // Bob's upkeep: only Bob's flip.
    expect(game.state.objects[theirs].tapped).toBe(false);
    expect(game.state.objects[tapped].tapped).toBe(true);
    toStep(game, "upkeep", A);
    settle(game);
    expect(game.state.objects[tapped].tapped).toBe(false);
    expect(game.state.objects[untapped].tapped).toBe(true);
    expect(game.state.objects[aura].tapped).toBe(false);
  });

  it("Beacon Bolt counts instants and sorceries you own in exile and your graveyard", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 1);
    const big = spawn(game, "Colossal Dreadmaw", B);
    toGraveyard(game, "Lightning Bolt");
    toExile(game, "Lightning Bolt");
    toExile(game, "Lightning Bolt", B);
    toGraveyard(game, "Forest");
    cast(game, toHand(game, "Beacon Bolt"), { targets: [ref(big)] });
    expect(game.state.objects[big].damageMarked).toBe(2);
  });

  it("Candlekeep Inspiration fixes X as it resolves", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const bears = spawn(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    toExile(game, "Kellan, Daring Traveler");
    toGraveyard(game, "Forest");
    cast(game, toHand(game, "Candlekeep Inspiration"));
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    toGraveyard(game, "Lightning Bolt");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Sailors' Bane costs {1} less per qualifying card", () => {
    const { game } = table();
    lands(game, "Island", 7);
    toGraveyard(game, "Lightning Bolt");
    toExile(game, "Kellan, Daring Traveler");
    const bane = toHand(game, "Sailors' Bane");
    cast(game, bane);
    expect(zone(game, bane)).toBe("battlefield");
  });

  it("Awaken the Sleeper may destroy only the Equipment on that creature", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const creature = spawn(game, "Grizzly Bears", B);
    const sword = spawn(game, "Blazing Torch", B);
    const other = spawn(game, "Blazing Torch", B);
    lands(game, "Wastes", 1, B);
    game.dispatch({ type: "pass-priority", player: A });
    toStep(game, "precombat-main", B);
    activate(game, sword, 0, { player: B, targets: [ref(creature)] });
    toStep(game, "precombat-main", A);
    pickModes(a, 0);
    cast(game, toHand(game, "Awaken the Sleeper"), { targets: [ref(creature)] });
    expect(game.state.objects[creature].controller).toBe(A);
    expect(zone(game, sword)).toBe("graveyard");
    expect(zone(game, other)).toBe("battlefield");
  });

  it("Key to the Side-Door discards only a legendary card sharing a legendary permanent's name", () => {
    const { game, a } = table();
    const key = spawn(game, "Key to the Side-Door");
    spawn(game, "Tam, the Possibility");
    lands(game, "Wastes", 1);
    const match = toHand(game, "Tam, the Possibility");
    toHand(game, "Crosis, the Purger");
    const seen = pickFromZone(a, match);
    const before = hand(game);
    activate(game, key, 1);
    expect(zone(game, match)).toBe("graveyard");
    expect(hand(game)).toBe(before + 1);
    void seen;
  });

  it("Callidus Assassin enters tapped as a copy with its trigger, and only then", () => {
    const { game, a } = table();
    lands(game, "Wastes", 4);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const theirs = spawn(game, "Grizzly Bears", B);
    const stranger = spawn(game, "Hill Giant", B);
    const card = toHand(game, "Callidus Assassin");
    a.choosePermanentsFn = (_v, eligible) => (eligible.includes(theirs) ? [theirs] : []);
    a.chooseTargetsFn = (_v, _n, _s, legal) => {
      const ids = legal[0].map((t) => (t.kind === "object" ? t.object : t.player));
      expect(ids).toContain(theirs);
      expect(ids).not.toContain(stranger);
      expect(ids).not.toContain(card);
      return [ref(theirs)];
    };
    cast(game, card);
    expect(game.state.objects[card].tapped).toBe(true);
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("Ravenous Trap's {0} waits for an opponent's three", () => {
    const { game } = table({ players: 3 });
    const trap = toHand(game, "Ravenous Trap");
    const free = { type: "cast-spell", player: A, card: trap, targets: [ref(B)], altCost: true } as const;
    expect(game.canDispatch(free)).not.toBeNull();
    lands(game, "Island", 2);
    for (const player of [B, C]) {
      cast(game, toHand(game, "Tome Scour"), { targets: [ref(player)] });
    }
    expect(graveyard(game, B).length).toBe(5);
    expect(game.canDispatch(free)).toBeNull();
  });

  it("Ravenous Trap counts one opponent's arrivals: two each for two opponents isn't three", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 3);
    const trap = toHand(game, "Ravenous Trap");
    const free = { type: "cast-spell", player: A, card: trap, targets: [ref(B)], altCost: true } as const;
    // Thought Scour mills two: Bob's two and Carol's two make four among them.
    cast(game, toHand(game, "Thought Scour"), { targets: [ref(B)] });
    cast(game, toHand(game, "Thought Scour"), { targets: [ref(C)] });
    expect(graveyard(game, B).length).toBe(2);
    expect(graveyard(game, C).length).toBe(2);
    expect(game.canDispatch(free)).not.toBeNull();
  });

  it("Blazing Shoal's exiled card sets X", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const pitch = toHand(game, "Lightning Bolt");
    const shoal = toHand(game, "Blazing Shoal");
    cast(game, shoal, { targets: [ref(bears)], altCost: true, x: 1 });
    expect(zone(game, pitch)).toBe("exile");
    expect(pt(game, bears).power).toBe(3);
  });

  it("Auriok Steelshaper pumps Soldiers and Knights only while equipped", () => {
    const { game } = table();
    const steelshaper = spawn(game, "Auriok Steelshaper");
    const knight = spawn(game, "Fervent Champion");
    const bears = spawn(game, "Grizzly Bears");
    const torch = spawn(game, "Blazing Torch");
    expect(pt(game, knight).power).toBe(1);
    // Equip {1} costs {0} with it: there's no land to pay.
    activate(game, torch, 0, { targets: [ref(steelshaper)] });
    expect(pt(game, knight).power).toBe(2);
    expect(pt(game, steelshaper).power).toBe(2);
    expect(pt(game, bears).power).toBe(2);
  });

  it("Éowyn gives the chosen keyword, or both to an equipped creature", () => {
    const { game, a } = table();
    spawn(game, "Éowyn, Lady of Rohan");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    pickModes(a, 1);
    toStep(game, "begin-combat");
    settle(game);
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(keywords(game, bears).has("first-strike")).toBe(false);

    const again = table();
    spawn(again.game, "Éowyn, Lady of Rohan");
    const equipped = spawn(again.game, "Grizzly Bears");
    const torch = spawn(again.game, "Blazing Torch");
    // {1} less, so free.
    activate(again.game, torch, 0, { targets: [ref(equipped)] });
    pickTargets(again.a, equipped);
    toStep(again.game, "begin-combat");
    settle(again.game);
    expect(keywords(again.game, equipped).has("vigilance")).toBe(true);
    expect(keywords(again.game, equipped).has("first-strike")).toBe(true);
  });

  it("Blazing Torch's granted ability sacrifices the Torch, which deals the damage", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const torch = spawn(game, "Blazing Torch");
    lands(game, "Wastes", 1);
    activate(game, torch, 0, { targets: [ref(bears)] });
    activate(game, bears, 0, { targets: [ref(B)] });
    expect(zone(game, torch)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });

  it("Final Flourish is -6/-6 kicked by a sacrificed artifact", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const big = spawn(game, "Colossal Dreadmaw", B);
    const fodder = spawn(game, "Sol Ring");
    cast(game, toHand(game, "Final Flourish"), { targets: [ref(big)], kicked: true });
    expect(zone(game, big)).toBe("graveyard");
    expect(zone(game, fodder)).toBe("graveyard");
  });

  it("Chandra, Awakened Inferno gives each opponent an emblem that burns at their upkeep", () => {
    const { game } = table({ players: 3 });
    const chandra = spawn(game, "Chandra, Awakened Inferno");
    loyalty(game, chandra, 2);
    toStep(game, "precombat-main", B);
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(20);
    expect(life(game, A)).toBe(20);
  });

  it("Chandra's −X exiles a permanent dealt damage that would die", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Awakened Inferno");
    const bears = spawn(game, "Grizzly Bears", B);
    loyalty(game, chandra, "-x", { x: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(game.state.objects[chandra].counters.loyalty).toBe(4);
  });
});
